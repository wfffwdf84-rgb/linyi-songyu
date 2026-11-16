/**
 * Pure-function checks for the announcement banner: no database, no Next
 * runtime, no test framework. TypeScript is stripped by Node itself, so the
 * script needs the transform flag because the error classes use constructor
 * parameter properties (the same shape as the rest of the stores):
 *
 *   node --experimental-transform-types scripts/check-announcements.mjs
 *
 * It covers the rules the acceptance list calls out - window boundaries, which
 * announcement wins, fail-open parsing, validation - and the dismiss key the
 * bar writes to localStorage. Rendering is verified in the browser, not here.
 */
import assert from "node:assert/strict";
import {
  announcementDismissKey,
  announcementLocaleText,
  announcementWindowState,
  parseAnnouncements,
  pickActiveAnnouncement,
  resolveAnnouncement,
  sanitizeAnnouncementPatch,
  sanitizeNewAnnouncement,
  sortAnnouncementsByNewest,
} from "../src/lib/announcement-rules.ts";

let checks = 0;

function check(name, fn) {
  fn();
  checks += 1;
  console.log(`ok - ${name}`);
}

function announcement(overrides = {}) {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    active: true,
    style: "info",
    text: { en: "Factory closed for the holiday", zh: "假期放假通知" },
    dismissible: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function expectCode(fn, code) {
  assert.throws(fn, (error) => error instanceof Error && error.code === code);
}

/* ---------------------------------------------------------- window bounds */
const windowed = announcement({
  startAt: "2026-03-01T00:00:00.000Z",
  endAt: "2026-03-02T00:00:00.000Z",
});

check("before startAt -> scheduled, not shown", () => {
  assert.equal(announcementWindowState(windowed, "2026-02-28T23:59:59.999Z"), "scheduled");
  assert.equal(pickActiveAnnouncement([windowed], "2026-02-28T23:59:59.999Z"), null);
});

check("exactly at startAt -> live (left-closed)", () => {
  assert.equal(announcementWindowState(windowed, "2026-03-01T00:00:00.000Z"), "live");
  assert.ok(pickActiveAnnouncement([windowed], "2026-03-01T00:00:00.000Z"));
});

check("exactly at endAt -> expired (right-open)", () => {
  assert.equal(announcementWindowState(windowed, "2026-03-02T00:00:00.000Z"), "expired");
  assert.equal(pickActiveAnnouncement([windowed], "2026-03-02T00:00:00.000Z"), null);
});

check("open-ended windows: only startAt, only endAt, neither", () => {
  assert.equal(announcementWindowState(announcement({ startAt: "2026-01-01T00:00:00.000Z" }), "2027-01-01T00:00:00.000Z"), "live");
  assert.equal(announcementWindowState(announcement({ endAt: "2026-01-01T00:00:00.000Z" }), "2027-01-01T00:00:00.000Z"), "expired");
  assert.equal(announcementWindowState(announcement(), "2027-01-01T00:00:00.000Z"), "always");
});

/* --------------------------------------------------------------- selection */
check("inactive is never picked, even with everything else in place", () => {
  assert.equal(pickActiveAnnouncement([announcement({ active: false })], "2026-06-01T00:00:00.000Z"), null);
  assert.equal(pickActiveAnnouncement([], "2026-06-01T00:00:00.000Z"), null);
});

check("several active: newest createdAt wins", () => {
  const older = announcement({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" });
  const newer = announcement({ id: "b", createdAt: "2026-02-01T00:00:00.000Z" });
  assert.equal(pickActiveAnnouncement([older, newer], "2026-06-01T00:00:00.000Z").id, "b");
  assert.equal(pickActiveAnnouncement([newer, older], "2026-06-01T00:00:00.000Z").id, "b");
});

check("same createdAt: newer updatedAt, then id, keeps the pick stable", () => {
  const first = announcement({ id: "a", updatedAt: "2026-01-02T00:00:00.000Z" });
  const second = announcement({ id: "b", updatedAt: "2026-01-03T00:00:00.000Z" });
  assert.equal(pickActiveAnnouncement([first, second], "2026-06-01T00:00:00.000Z").id, "b");
  const c = announcement({ id: "c" });
  const d = announcement({ id: "d" });
  assert.equal(pickActiveAnnouncement([d, c], "2026-06-01T00:00:00.000Z").id, "c");
});

check("an expired newer announcement loses to a live older one", () => {
  const expiredNew = announcement({
    id: "new",
    createdAt: "2026-05-01T00:00:00.000Z",
    endAt: "2026-05-02T00:00:00.000Z",
  });
  const liveOld = announcement({ id: "old", createdAt: "2026-01-01T00:00:00.000Z" });
  assert.equal(pickActiveAnnouncement([expiredNew, liveOld], "2026-06-01T00:00:00.000Z").id, "old");
});

check("list order helper is newest first", () => {
  const list = sortAnnouncementsByNewest([
    announcement({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" }),
    announcement({ id: "b", createdAt: "2026-03-01T00:00:00.000Z" }),
    announcement({ id: "c", createdAt: "2026-02-01T00:00:00.000Z" }),
  ]);
  assert.deepEqual(list.map((item) => item.id), ["b", "c", "a"]);
});

/* ---------------------------------------------------------- fail-open read */
check("corrupt document reads as no announcements", () => {
  assert.deepEqual(parseAnnouncements("{not json"), []);
  assert.deepEqual(parseAnnouncements("null"), []);
  assert.deepEqual(parseAnnouncements('{"version":1}'), []);
  assert.deepEqual(parseAnnouncements('{"announcements":"nope"}'), []);
});

check("a broken record is dropped, its neighbours survive", () => {
  const body = JSON.stringify({
    version: 1,
    updatedAt: "2026-01-01T00:00:00.000Z",
    announcements: [
      announcement({ id: "keep-1" }),
      { id: "no-text", text: { en: "   " } },
      { text: { en: "no id" } },
      null,
      announcement({ id: "keep-2" }),
    ],
  });
  assert.deepEqual(parseAnnouncements(body).map((item) => item.id), ["keep-1", "keep-2"]);
});

check("stored values are coerced: bad href dropped, inverted window dropped, active needs true", () => {
  const body = JSON.stringify({
    announcements: [
      announcement({ id: "x", href: "javascript:alert(1)", active: "yes", style: "weird" }),
      announcement({ id: "y", startAt: "2026-02-01T00:00:00.000Z", endAt: "2026-01-01T00:00:00.000Z" }),
    ],
  });
  const [x, y] = parseAnnouncements(body);
  assert.equal(x.href, undefined);
  assert.equal(x.active, false);
  assert.equal(x.style, "info");
  assert.equal(y.startAt, undefined);
  assert.equal(y.endAt, undefined);
});

/* ------------------------------------------------------------- validation */
check("text.en is required and both languages are capped at 200", () => {
  assert.deepEqual(sanitizeNewAnnouncement({ text: { en: "Sale" } }).text, { en: "Sale" });
  expectCode(() => sanitizeNewAnnouncement({ text: { en: "  " } }), "invalid_text");
  expectCode(() => sanitizeNewAnnouncement({ text: { en: "x".repeat(201) } }), "invalid_text");
  expectCode(() => sanitizeNewAnnouncement({ text: { en: "ok", zh: "中".repeat(201) } }), "invalid_text");
});

check("href must be a site path or https://", () => {
  assert.equal(sanitizeNewAnnouncement({ text: { en: "a" }, href: "/parts" }).href, "/parts");
  assert.equal(sanitizeNewAnnouncement({ text: { en: "a" }, href: "https://example.com" }).href, "https://example.com");
  expectCode(() => sanitizeNewAnnouncement({ text: { en: "a" }, href: "http://example.com" }), "invalid_href");
  expectCode(() => sanitizeNewAnnouncement({ text: { en: "a" }, href: "//evil.example" }), "invalid_href");
  expectCode(() => sanitizeNewAnnouncement({ text: { en: "a" }, href: "javascript:alert(1)" }), "invalid_href");
});

check("startAt must be strictly before endAt", () => {
  const start = "2026-03-01T00:00:00.000Z";
  const later = "2026-03-02T00:00:00.000Z";
  assert.ok(sanitizeNewAnnouncement({ text: { en: "a" }, startAt: start, endAt: later }).endAt);
  expectCode(() => sanitizeNewAnnouncement({ text: { en: "a" }, startAt: start, endAt: start }), "invalid_schedule");
  expectCode(
    () => sanitizeNewAnnouncement({ text: { en: "a" }, startAt: later, endAt: start }),
    "invalid_schedule",
  );
  expectCode(() => sanitizeNewAnnouncement({ text: { en: "a" }, startAt: "not a date" }), "invalid_schedule");
});

check("style and boolean flags are validated, defaults are safe", () => {
  const draft = sanitizeNewAnnouncement({ text: { en: "a" } });
  assert.equal(draft.style, "info");
  assert.equal(draft.active, false);
  assert.equal(draft.dismissible, true);
  expectCode(() => sanitizeNewAnnouncement({ text: { en: "a" }, style: "loud" }), "invalid_style");
  expectCode(() => sanitizeNewAnnouncement({ text: { en: "a" }, active: "true" }), "invalid_announcement");
});

check("a patch only changes what it names; null clears a field", () => {
  const current = announcement({
    href: "https://example.com",
    startAt: "2026-03-01T00:00:00.000Z",
    endAt: "2026-03-02T00:00:00.000Z",
  });
  const patched = resolveAnnouncement(
    current,
    sanitizeAnnouncementPatch({ href: null, active: false }),
  );
  assert.equal(patched.href, undefined);
  assert.equal(patched.active, false);
  assert.equal(patched.text.en, current.text.en);
  assert.equal(patched.startAt, current.startAt);
  assert.equal(patched.style, current.style);
});

/* ------------------------------------------------------- display helpers */
check("Chinese copy is used on zh, English everywhere else", () => {
  const text = { en: "Holiday notice", zh: "放假通知" };
  assert.equal(announcementLocaleText(text, "zh"), "放假通知");
  assert.equal(announcementLocaleText(text, "en"), "Holiday notice");
  assert.equal(announcementLocaleText(text, "ar"), "Holiday notice");
  assert.equal(announcementLocaleText({ en: "Only English" }, "zh"), "Only English");
});

check("dismiss storage key is dismissed:<id>", () => {
  assert.equal(announcementDismissKey("abc"), "dismissed:abc");
});

console.log(`\n${checks} checks passed`);
