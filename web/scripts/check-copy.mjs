/**
 * Pure-function checks for the site copy overlay: no database, no Next runtime,
 * no test framework. TypeScript is stripped by Node itself, so the script needs
 * the transform flag because the error class uses a constructor parameter
 * property (the same shape as the rest of the stores):
 *
 *   node --experimental-transform-types scripts/check-copy.mjs
 *
 * It covers the acceptance list: the namespace whitelist and its exclusions, the
 * length cap and control-character stripping, fail-open parsing, the deep merge
 * that keeps a bad override from breaking the bundle, and the save/restore cycle
 * over an in-memory document using the exact functions the API calls.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  applyCopyOverrides,
  applyCopyPlan,
  collectCopyOriginals,
  copyGroupRows,
  copyKeyNamespace,
  copyOverridesEqual,
  COPY_EXCLUDED_NAMESPACES,
  COPY_GROUPS,
  COPY_NAMESPACES,
  COPY_VALUE_MAX,
  findCopyGroup,
  isEditableCopyKey,
  parseCopyDocument,
  parseCopyPatch,
  planCopyEntries,
  sanitizeCopyValue,
} from "../src/lib/copy-rules.ts";

const appLocales = [
  "en", "zh", "ar", "fr", "th", "id", "vi", "ms", "pt", "ru", "ko", "ja", "es",
];

let checks = 0;

function check(name, fn) {
  fn();
  checks += 1;
  console.log(`ok - ${name}`);
}

function expectCode(fn, code) {
  assert.throws(fn, (error) => error instanceof Error && error.code === code);
}

/** A tiny stand-in for one locale's message bundle. */
function bundle() {
  return {
    meta: { homeTitle: "SEO title" },
    lang: { zh: "中文" },
    terms: { title: "Terms of service" },
    home: { heroTitle: "Original hero", heroBadge: "Badge" },
    nav: { home: "Home", products: "Products" },
    catalog: { quote: "Quote" },
    quote: { submit: "Send" },
    product: { specs: "Specs" },
  };
}

/** The exact write the API performs: diff, prune, apply to one locale. */
function save(stored, locale, entries, originals) {
  const plan = planCopyEntries(entries, originals);
  const next = { ...stored };
  const localeNext = applyCopyPlan(next[locale] ?? {}, plan);
  if (Object.keys(localeNext).length > 0) next[locale] = localeNext;
  else delete next[locale];
  return next;
}

/* -------------------------------------------------------------- whitelist */
check("the eight whitelisted namespaces are editable", () => {
  for (const namespace of COPY_NAMESPACES) {
    assert.equal(isEditableCopyKey(`${namespace}.someKey`), true, namespace);
  }
});

check("policy, SEO and language namespaces are refused", () => {
  for (const namespace of COPY_EXCLUDED_NAMESPACES) {
    assert.equal(isEditableCopyKey(`${namespace}.anything`), false, namespace);
  }
  // The exclusions the brief names explicitly, asserted one by one.
  for (const key of [
    "terms.title",
    "privacy.body",
    "payment.method",
    "shipping.lead",
    "meta.homeTitle",
    "lang.zh",
    "common.save",
  ]) {
    assert.equal(isEditableCopyKey(key), false, key);
  }
});

check("malformed keys are not editable", () => {
  for (const key of ["", "home", ".home", "home.", "homex.a", 42, null, undefined]) {
    assert.equal(isEditableCopyKey(key), false, String(key));
  }
  assert.equal(copyKeyNamespace("home.heroTitle"), "home");
  assert.equal(copyKeyNamespace("nope"), "");
});

/* ------------------------------------------------------------- validation */
check("the API rejects an excluded namespace server side", () => {
  // parseCopyPatch is what the route calls before touching storage.
  expectCode(
    () => parseCopyPatch({ locale: "en", entries: { "terms.title": "Free for all" } }, appLocales),
    "invalid_key",
  );
  expectCode(
    () => parseCopyPatch({ locale: "en", entries: { "meta.homeTitle": "SEO" } }, appLocales),
    "invalid_key",
  );
  const patch = parseCopyPatch({ locale: "zh", entries: { "home.heroTitle": "新的标题" } }, appLocales);
  assert.deepEqual(patch, { locale: "zh", entries: { "home.heroTitle": "新的标题" } });
});

check("the API rejects a bad locale, empty and oversized payloads", () => {
  expectCode(() => parseCopyPatch({ locale: "xx", entries: { "home.a": "b" } }, appLocales), "invalid_locale");
  expectCode(() => parseCopyPatch({ locale: "en", entries: {} }, appLocales), "empty");
  expectCode(() => parseCopyPatch({ locale: "en", entries: { "home.a": 5 } }, appLocales), "invalid_value");
  expectCode(() => parseCopyPatch(null, appLocales), "invalid_body");
  const tooMany = {};
  for (let index = 0; index <= 500; index += 1) tooMany[`home.k${index}`] = "x";
  expectCode(() => parseCopyPatch({ locale: "en", entries: tooMany }, appLocales), "too_many_entries");
});

check("values over 400 characters are refused, 400 is accepted", () => {
  const originals = { "home.heroTitle": "Original" };
  assert.equal(sanitizeCopyValue("x".repeat(COPY_VALUE_MAX), "home.heroTitle").length, COPY_VALUE_MAX);
  expectCode(
    () => planCopyEntries({ "home.heroTitle": "x".repeat(COPY_VALUE_MAX + 1) }, originals),
    "too_long",
  );
  expectCode(() => sanitizeCopyValue("x".repeat(COPY_VALUE_MAX + 1), "home.heroTitle"), "too_long");
});

check("control characters and angle brackets are stripped", () => {
  assert.equal(sanitizeCopyValue("  hello\u0000\u001f<b>world</b>  ", "home.a"), "hellobworld/b");
  assert.equal(sanitizeCopyValue("\ttrim me\n", "home.a"), "trim me");
});

check("a key the locale does not carry cannot be overridden", () => {
  expectCode(
    () => planCopyEntries({ "home.notThere": "x" }, { "home.heroTitle": "Original" }),
    "unknown_key",
  );
});

/* ------------------------------------------------------------------ merge */
check("the override wins, everything else keeps the shipped text", () => {
  const messages = bundle();
  const merged = applyCopyOverrides(messages, { "home.heroTitle": "Edited hero" });
  assert.equal(merged.home.heroTitle, "Edited hero");
  assert.equal(merged.home.heroBadge, "Badge");
  assert.equal(merged.terms.title, "Terms of service");
  assert.equal(merged.meta.homeTitle, "SEO title");
  // The shipped bundle is a module singleton: it must never be mutated.
  assert.equal(messages.home.heroTitle, "Original hero");
});

check("no overrides means the very same bundle is returned", () => {
  const messages = bundle();
  assert.equal(applyCopyOverrides(messages, {}), messages);
  assert.equal(applyCopyOverrides(messages, null), messages);
  assert.equal(applyCopyOverrides(messages, "nope"), messages);
});

check("an override cannot add keys or change the document shape", () => {
  const messages = bundle();
  const merged = applyCopyOverrides(messages, {
    "home.newKey": "added?",
    "home.heroTitle": { nested: "object" },
    "terms.title": "smuggled",
  });
  assert.equal("newKey" in merged.home, false);
  assert.equal(typeof merged.home.heroTitle, "string");
  assert.equal(merged.terms.title, "Terms of service");
});

check("a missing key in the override falls back to the original", () => {
  const messages = bundle();
  const merged = applyCopyOverrides(messages, { "home.heroBadge": "Edited badge" });
  assert.equal(merged.home.heroTitle, "Original hero");
  assert.equal(merged.home.heroBadge, "Edited badge");
});

check("originals are flattened to editable keys only", () => {
  const originals = collectCopyOriginals(bundle());
  assert.equal(originals["home.heroTitle"], "Original hero");
  assert.equal(originals["nav.home"], "Home");
  assert.equal("terms.title" in originals, false);
  assert.equal("meta.homeTitle" in originals, false);
  assert.equal("product.specs" in originals, false);
});

/* -------------------------------------------------------------- fail open */
check("a corrupt or malformed document reads as no overrides", () => {
  assert.deepEqual(parseCopyDocument("{not json", appLocales), {});
  assert.deepEqual(parseCopyDocument("null", appLocales), {});
  assert.deepEqual(parseCopyDocument('{"overrides":"nope"}', appLocales), {});
  assert.deepEqual(parseCopyDocument(JSON.stringify({ overrides: { en: [] } }), appLocales), {});
});

check("stored entries are filtered: locale, namespace, length, type", () => {
  const stored = JSON.stringify({
    version: 1,
    updatedAt: "2026-01-01T00:00:00.000Z",
    overrides: {
      en: {
        "home.heroTitle": "Kept",
        "terms.title": "Smuggled policy copy",
        "home.blank": "   ",
        "home.long": "x".repeat(COPY_VALUE_MAX + 1),
        "home.number": 12,
      },
      klingon: { "home.heroTitle": "unknown locale" },
    },
  });
  const overrides = parseCopyDocument(stored, appLocales);
  assert.deepEqual(overrides, { en: { "home.heroTitle": "Kept" } });
});

/* ------------------------------------------------------------------ panel */
check("groups cover every editable namespace exactly once", () => {
  const seen = [];
  for (const group of COPY_GROUPS) for (const namespace of group.namespaces) seen.push(namespace);
  assert.deepEqual([...seen].sort(), [...COPY_NAMESPACES].sort());
  assert.equal(new Set(seen).size, seen.length);
  assert.ok(findCopyGroup("nav").namespaces.includes("quote"));
});

check("rows carry key, original, current value and the modified flag", () => {
  const group = findCopyGroup("nav");
  const originals = { "nav.home": "Home", "nav.products": "Products", "catalog.quote": "Quote", "home.heroTitle": "Hero" };
  const rows = copyGroupRows(group, originals, { "nav.products": "Goods" });
  assert.deepEqual(
    rows.map((row) => [row.key, row.original, row.value, row.overridden]),
    [
      ["nav.home", "Home", "Home", false],
      ["nav.products", "Products", "Goods", true],
      ["catalog.quote", "Quote", "Quote", false],
    ],
  );
});

/* ------------------------------------------------- save / restore (mock) */
check("saving writes only the overlay, and restores when the value is the original", () => {
  const originals = collectCopyOriginals(bundle());
  let stored = {};

  stored = save(stored, "en", { "home.heroTitle": "Edited hero" }, originals);
  assert.deepEqual(stored, { en: { "home.heroTitle": "Edited hero" } });

  // "Save" persists the document as JSON and the next request parses it back.
  const body = `${JSON.stringify({ version: 1, updatedAt: "2026-01-01T00:00:00.000Z", overrides: stored }, null, 2)}\n`;
  const reloaded = parseCopyDocument(body, appLocales);
  const merged = applyCopyOverrides(bundle(), reloaded.en);
  assert.equal(merged.home.heroTitle, "Edited hero");

  // Typing the shipped text back is a restore, not an override.
  stored = save(stored, "en", { "home.heroTitle": originals["home.heroTitle"] }, originals);
  assert.deepEqual(stored, {});
  const restored = applyCopyOverrides(bundle(), parseCopyDocument(
    JSON.stringify({ version: 1, updatedAt: "2026-01-01T00:00:00.000Z", overrides: stored }),
    appLocales,
  ).en);
  assert.equal(restored.home.heroTitle, "Original hero");
});

check("an empty value also restores the original", () => {
  const originals = collectCopyOriginals(bundle());
  let stored = save({}, "en", { "nav.home": "Homepage" }, originals);
  assert.deepEqual(stored, { en: { "nav.home": "Homepage" } });
  stored = save(stored, "en", { "nav.home": "   " }, originals);
  assert.deepEqual(stored, {});
});

check("saving one locale never touches another", () => {
  const originals = collectCopyOriginals(bundle());
  let stored = save({}, "en", { "home.heroTitle": "EN hero" }, originals);
  stored = save(stored, "zh", { "home.heroTitle": "中文标题" }, originals);
  assert.equal(stored.en["home.heroTitle"], "EN hero");
  assert.equal(stored.zh["home.heroTitle"], "中文标题");
  // Restoring the Chinese one leaves the English override in place.
  stored = save(stored, "zh", { "home.heroTitle": originals["home.heroTitle"] }, originals);
  assert.equal(stored.zh, undefined);
  assert.equal(stored.en["home.heroTitle"], "EN hero");
});

check("an unchanged save is detected, so the document is not rewritten", () => {
  const originals = collectCopyOriginals(bundle());
  const stored = save({}, "en", { "home.heroBadge": "New badge" }, originals);
  const plan = planCopyEntries({ "home.heroBadge": "  New badge  " }, originals);
  const after = applyCopyPlan(stored.en, plan);
  assert.equal(copyOverridesEqual(stored.en, after), true);
  const changed = applyCopyPlan(stored.en, planCopyEntries({ "home.heroBadge": "Other" }, originals));
  assert.equal(copyOverridesEqual(stored.en, changed), false);
});

/* ------------------------------------------------- real message bundles */
check("the real 13 bundles keep every whitelisted key under the cap", () => {
  for (const locale of appLocales) {
    const raw = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"));
    const originals = collectCopyOriginals(raw);
    assert.ok(Object.keys(originals).length > 300, `${locale} has ${Object.keys(originals).length} editable keys`);
    for (const [key, value] of Object.entries(originals)) {
      assert.ok(value.length <= COPY_VALUE_MAX, `${locale} ${key} is ${value.length} chars`);
      assert.equal(isEditableCopyKey(key), true, key);
    }
    // Every editable key exists in en, so an override is always applicable.
    if (locale !== "en") {
      const english = collectCopyOriginals(
        JSON.parse(readFileSync(new URL("../messages/en.json", import.meta.url), "utf8")),
      );
      assert.deepEqual(Object.keys(originals).sort(), Object.keys(english).sort(), locale);
    }
  }
});

check("a real override merges into a real bundle without mutating it", () => {
  const zh = JSON.parse(readFileSync(new URL("../messages/zh.json", import.meta.url), "utf8"));
  const before = zh.home.heroTitle;
  const merged = applyCopyOverrides(zh, { "home.heroTitle": "运营改过的标题" });
  assert.equal(merged.home.heroTitle, "运营改过的标题");
  assert.equal(zh.home.heroTitle, before);
  assert.equal(merged.terms, zh.terms);
});

console.log(`\n${checks} checks passed`);
