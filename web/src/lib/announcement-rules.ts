/**
 * The announcement document, its rules, and nothing else.
 *
 * This module deliberately has no imports: it is the half of the feature that
 * runs inside a client component (the bar's preview, the admin form) as well as
 * on the server, so it must not reach for storage, Node built-ins or the admin
 * session. `src/lib/announcements.ts` adds the storage layer on top.
 *
 * The document is plain JSON. Unlike the product overlay it holds no prices, so
 * it is not encrypted: a banner is public copy by definition.
 */

/** Up to this many announcements share the document; the panel warns before it bites. */
export const ANNOUNCEMENTS_MAX = 30;

/** `text.en` is required and both languages are capped at this. */
export const ANNOUNCEMENT_TEXT_MAX = 200;

/** A pasted tracking URL, not a page of prose. */
export const ANNOUNCEMENT_HREF_MAX = 500;

export const announcementStyles = ["info", "warning", "promo"] as const;

export type AnnouncementStyle = (typeof announcementStyles)[number];

export function isAnnouncementStyle(value: unknown): value is AnnouncementStyle {
  return typeof value === "string" && (announcementStyles as readonly string[]).includes(value);
}

/** Only these two languages are stored; every other locale falls back to `en`. */
export type AnnouncementText = { en: string; zh?: string };

export type Announcement = {
  id: string;
  active: boolean;
  style: AnnouncementStyle;
  text: AnnouncementText;
  /** Site-relative (`/parts`) or absolute `https://`; absent means a plain bar. */
  href?: string;
  /** ISO instant; absent means "no lower bound". */
  startAt?: string;
  /** ISO instant; absent means "no upper bound". The end is exclusive. */
  endAt?: string;
  dismissible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AnnouncementDocument = {
  version: 1;
  updatedAt: string;
  announcements: Announcement[];
};

/** Everything a form may set; identity and audit stamps are the store's job. */
export type AnnouncementInput = Omit<Announcement, "id" | "createdAt" | "updatedAt">;

/**
 * A partial form payload. `null` clears an optional field, which is different
 * from `undefined` (= "leave it alone"), so an empty date input can remove a
 * schedule instead of being ignored.
 */
export type AnnouncementPatch = {
  active?: boolean;
  style?: AnnouncementStyle;
  text?: Partial<AnnouncementText>;
  href?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  dismissible?: boolean;
};

/** Raised for request-level problems; the code becomes the API error string. */
export class AnnouncementError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "AnnouncementError";
  }
}

/* -------------------------------------------------------------------- text */

function clean(value: string) {
  // Control characters and angle brackets are stripped everywhere else in this
  // codebase: the value is rendered as text, never parsed as markup.
  return value.replace(/[\u0000-\u001f\u007f<>]/g, "");
}

/** Escaping the storage key here keeps writer and reader in step. */
export function announcementDismissKey(id: string) {
  return `dismissed:${id}`;
}

/** The copy a visitor of `locale` reads: Chinese when present, English otherwise. */
export function announcementLocaleText(text: AnnouncementText, locale: string) {
  if (locale === "zh" && text.zh) return text.zh;
  return text.en;
}

/* -------------------------------------------------------------------- time */

function toTime(value: Date | number | string): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : Date.now();
}

export type AnnouncementWindowState = "always" | "scheduled" | "live" | "expired";

/**
 * Where `item` sits relative to its own window at `now`.
 *
 * The window is half-open: `[startAt, endAt)`. At exactly `startAt` the banner
 * shows; at exactly `endAt` it is already gone. A one-sided window is open on
 * the missing side, and no window at all is "always".
 */
export function announcementWindowState(
  item: Pick<Announcement, "startAt" | "endAt">,
  now: Date | number | string = new Date(),
): AnnouncementWindowState {
  const at = toTime(now);
  const start = item.startAt ? Date.parse(item.startAt) : Number.NaN;
  const end = item.endAt ? Date.parse(item.endAt) : Number.NaN;
  const hasStart = Number.isFinite(start);
  const hasEnd = Number.isFinite(end);
  if (!hasStart && !hasEnd) return "always";
  if (hasStart && at < start) return "scheduled";
  if (hasEnd && at >= end) return "expired";
  return "live";
}

/* --------------------------------------------------------------- ordering */

function compareNewestFirst(left: Announcement, right: Announcement) {
  // ISO-8601 strings in the stored `toISOString()` form sort chronologically as
  // plain strings, which keeps the comparison timezone-free.
  const byCreated = right.createdAt.localeCompare(left.createdAt);
  if (byCreated !== 0) return byCreated;
  const byUpdated = right.updatedAt.localeCompare(left.updatedAt);
  if (byUpdated !== 0) return byUpdated;
  // Ties still need a total order, otherwise the bar could flip between renders.
  return left.id.localeCompare(right.id);
}

/** Newest first, as everything in the panel displays the list. */
export function sortAnnouncementsByNewest(list: readonly Announcement[]): Announcement[] {
  return [...list].sort(compareNewestFirst);
}

/* ------------------------------------------------------------ public pick */

/**
 * The one announcement the site shows right now, or null.
 *
 * Rules, in order:
 * - `active === true` is required; a draft never renders.
 * - the announcement must be inside its window at `now` (see
 *   announcementWindowState for the exact boundaries);
 * - when several qualify, the newest `createdAt` wins, then the newest
 *   `updatedAt`, then the id, so the choice is stable and reproducible.
 */
export function pickActiveAnnouncement(
  list: readonly Announcement[],
  now: Date | number | string = new Date(),
): Announcement | null {
  let picked: Announcement | null = null;
  for (const item of list) {
    if (item.active !== true) continue;
    const state = announcementWindowState(item, now);
    if (state === "scheduled" || state === "expired") continue;
    if (!picked || compareNewestFirst(item, picked) < 0) picked = item;
  }
  return picked;
}

/* -------------------------------------------------------------- validation */

function textField(value: unknown, max: number): string {
  if (value === undefined) return "";
  if (typeof value !== "string") throw new AnnouncementError("invalid_text");
  const cleaned = clean(value).trim();
  if (cleaned.length > max) throw new AnnouncementError("invalid_text");
  return cleaned;
}

function parseTextPatch(value: unknown): Partial<AnnouncementText> {
  if (typeof value !== "object" || value === null) {
    throw new AnnouncementError("invalid_text");
  }
  const row = value as Record<string, unknown>;
  const text: Partial<AnnouncementText> = {};
  if (row.en !== undefined) text.en = textField(row.en, ANNOUNCEMENT_TEXT_MAX);
  if (row.zh !== undefined) text.zh = textField(row.zh, ANNOUNCEMENT_TEXT_MAX);
  if (Object.keys(text).length === 0) throw new AnnouncementError("invalid_text");
  return text;
}

function parseHref(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new AnnouncementError("invalid_href");
  const cleaned = clean(value).trim();
  if (!cleaned) return null;
  if (cleaned.length > ANNOUNCEMENT_HREF_MAX) throw new AnnouncementError("invalid_href");
  // A site-relative path is the common case; `//host` is protocol-relative and
  // would leave the site, so it is rejected as firmly as an unknown scheme.
  if (cleaned.startsWith("/") && !cleaned.startsWith("//")) return cleaned;
  if (cleaned.startsWith("https://")) return cleaned;
  throw new AnnouncementError("invalid_href");
}

function parseInstant(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new AnnouncementError("invalid_schedule");
  const raw = value.trim();
  if (!raw) return null;
  const time = Date.parse(raw);
  if (!Number.isFinite(time)) throw new AnnouncementError("invalid_schedule");
  return new Date(time).toISOString();
}

/** The form payload as a patch; throws AnnouncementError codes. */
export function sanitizeAnnouncementPatch(input: unknown): AnnouncementPatch {
  if (typeof input !== "object" || input === null) {
    throw new AnnouncementError("invalid_announcement");
  }
  const body = input as Record<string, unknown>;
  const patch: AnnouncementPatch = {};

  if (body.style !== undefined) {
    if (!isAnnouncementStyle(body.style)) throw new AnnouncementError("invalid_style");
    patch.style = body.style;
  }
  for (const flag of ["active", "dismissible"] as const) {
    if (body[flag] === undefined) continue;
    if (typeof body[flag] !== "boolean") throw new AnnouncementError("invalid_announcement");
    patch[flag] = body[flag] as boolean;
  }
  if (body.text !== undefined) patch.text = parseTextPatch(body.text);
  if (body.href !== undefined) patch.href = parseHref(body.href);
  if (body.startAt !== undefined) patch.startAt = parseInstant(body.startAt);
  if (body.endAt !== undefined) patch.endAt = parseInstant(body.endAt);

  return patch;
}

function mergeText(
  current: AnnouncementText | undefined,
  patch: Partial<AnnouncementText> | undefined,
): AnnouncementText {
  const en = patch?.en ?? current?.en ?? "";
  const zh = patch?.zh ?? current?.zh ?? "";
  const text: AnnouncementText = { en };
  if (zh) text.zh = zh;
  return text;
}

function mergeOptional(
  current: string | undefined,
  patch: string | null | undefined,
): string | undefined {
  if (patch === null) return undefined;
  return patch ?? current;
}

/**
 * Stacks a patch on the stored record (or on nothing, for a new one) and
 * validates the result as a whole. Invalid input throws; a valid return value
 * is ready to be written.
 */
export function resolveAnnouncement(
  current: Announcement | null,
  patch: AnnouncementPatch,
): AnnouncementInput {
  const text = mergeText(current?.text, patch.text);
  if (!text.en) throw new AnnouncementError("invalid_text");

  const input: AnnouncementInput = {
    active: patch.active ?? current?.active ?? false,
    style: patch.style ?? current?.style ?? "info",
    text,
    dismissible: patch.dismissible ?? current?.dismissible ?? true,
  };
  const href = mergeOptional(current?.href, patch.href);
  const startAt = mergeOptional(current?.startAt, patch.startAt);
  const endAt = mergeOptional(current?.endAt, patch.endAt);
  if (href) input.href = href;
  if (startAt) input.startAt = startAt;
  if (endAt) input.endAt = endAt;

  if (
    input.startAt &&
    input.endAt &&
    Date.parse(input.startAt) >= Date.parse(input.endAt)
  ) {
    // An empty or inverted window would never show; the operator meant something else.
    throw new AnnouncementError("invalid_schedule");
  }
  return input;
}

/** A new announcement from the create form, with the same rules applied. */
export function sanitizeNewAnnouncement(input: unknown): AnnouncementInput {
  return resolveAnnouncement(null, sanitizeAnnouncementPatch(input));
}

/* ------------------------------------------------------------ stored parse */

function coerceText(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return clean(value).slice(0, max).trim();
}

function coerceHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = clean(value).trim();
  if (!cleaned || cleaned.length > ANNOUNCEMENT_HREF_MAX) return undefined;
  if (cleaned.startsWith("https://")) return cleaned;
  if (cleaned.startsWith("/") && !cleaned.startsWith("//")) return cleaned;
  return undefined;
}

function coerceInstant(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const raw = value.trim();
  if (!raw) return undefined;
  const time = Date.parse(raw);
  return Number.isFinite(time) ? new Date(time).toISOString() : undefined;
}

function coerceAnnouncement(value: unknown): Announcement | null {
  if (typeof value !== "object" || value === null) return null;
  const row = value as Record<string, unknown>;

  const id = typeof row.id === "string" ? row.id.trim() : "";
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;

  const textRow = (typeof row.text === "object" && row.text !== null ? row.text : {}) as Record<
    string,
    unknown
  >;
  const en = coerceText(textRow.en, ANNOUNCEMENT_TEXT_MAX);
  // Without `text.en` there is nothing to render: dropping the record is better
  // than an empty bar.
  if (!en) return null;
  const text: AnnouncementText = { en };
  const zh = coerceText(textRow.zh, ANNOUNCEMENT_TEXT_MAX);
  if (zh) text.zh = zh;

  let startAt = coerceInstant(row.startAt);
  let endAt = coerceInstant(row.endAt);
  if (startAt && endAt && Date.parse(startAt) >= Date.parse(endAt)) {
    startAt = undefined;
    endAt = undefined;
  }

  const createdAt = coerceInstant(row.createdAt) ?? new Date(0).toISOString();
  const item: Announcement = {
    id,
    // Only a literal true enables the banner: a malformed value never shows.
    active: row.active === true,
    style: isAnnouncementStyle(row.style) ? row.style : "info",
    text,
    dismissible: row.dismissible === true,
    createdAt,
    updatedAt: coerceInstant(row.updatedAt) ?? createdAt,
  };
  const href = coerceHref(row.href);
  if (href) item.href = href;
  if (startAt) item.startAt = startAt;
  if (endAt) item.endAt = endAt;
  return item;
}

/**
 * A stored body back to records, tolerantly. A malformed document, a missing
 * `announcements` array and a broken record all read as "fewer announcements",
 * never as an exception: the public layout must not fail because of this file.
 */
export function parseAnnouncements(body: string): Announcement[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return [];
  }
  if (typeof parsed !== "object" || parsed === null) return [];
  const list = (parsed as Record<string, unknown>).announcements;
  if (!Array.isArray(list)) return [];

  const items: Announcement[] = [];
  for (const entry of list.slice(0, ANNOUNCEMENTS_MAX)) {
    const item = coerceAnnouncement(entry);
    if (item && !items.some((existing) => existing.id === item.id)) items.push(item);
  }
  return items;
}
