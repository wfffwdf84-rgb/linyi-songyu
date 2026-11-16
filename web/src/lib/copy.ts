import { unstable_cache } from "next/cache";
import { loadRawMessages } from "@/i18n/messages";
import {
  applyCopyPlan,
  collectCopyOriginals,
  copyKeyNamespace,
  copyOverridesEqual,
  CopyError,
  copyGroupRows,
  findCopyGroup,
  isEditableCopyKey,
  parseCopyDocument,
  parseCopyPatch,
  planCopyEntries,
  type CopyDocument,
  type CopyLocaleOverrides,
  type CopyOverrides,
  type CopyRow,
} from "@/lib/copy-rules";
import { appLocales } from "@/lib/locales";
import { readDocument, storageConfigured, writeDocument } from "@/lib/supabase";

/**
 * Storage for the site copy overlay.
 *
 * The document is one plain-text row of `songyu_documents` at the key-shaped
 * pathname the blob store used. It holds no secrets - it is public marketing copy
 * by definition - so it is not encrypted; the only guard is the admin API that
 * writes it.
 *
 * Reading is fail-open: an unconfigured store, a network failure or a corrupt
 * body all mean "no overrides", because a copy edit must never be able to 500 a
 * page or take the whole message bundle down with it. Writing is fail-closed: a
 * document that could not be read is never replaced with an empty one, which
 * would silently revert every locale.
 */

/** Fixed key: the only copy, read as one row and overwritten in place. */
export const COPY_OVERRIDES_PATH = "content/copy-overrides.json";

/**
 * Tag on the cached read, so a save expires it explicitly in addition to the
 * layout-wide path revalidation.
 */
export const COPY_OVERRIDES_TAG = "copy-overrides";

/** Why the last read produced its map; the panel shows it, visitors never do. */
export type CopyReadStatus = "" | "not_configured" | "unreadable";

export * from "@/lib/copy-rules";

/** One row read straight from the table. Throws; callers decide fail-open or not. */
async function loadOverrides(): Promise<CopyOverrides> {
  const body = await readDocument(COPY_OVERRIDES_PATH);
  if (body === null) return {};
  return parseCopyDocument(body, appLocales);
}

/**
 * The overlay is read while rendering every localized page, and `messages` are
 * imported once per process, so a request-scoped `cache()` would still query the
 * row on every page view. `unstable_cache` + a tag is the right home: one small
 * shared row, read once, expired by `revalidateTag` on every save.
 *
 * A failed read is cached as well, so one outage does not turn into one retry
 * per page. It is cached as "no overrides", which is what fail-open means here.
 */
const loadOverridesCached = unstable_cache(
  async (): Promise<{ overrides: CopyOverrides; status: CopyReadStatus }> => {
    if (!storageConfigured()) return { overrides: {}, status: "not_configured" };
    try {
      return { overrides: await loadOverrides(), status: "" };
    } catch (error) {
      console.error("copy overrides could not be read; serving the shipped copy", error);
      return { overrides: {}, status: "unreadable" };
    }
  },
  ["copy-overrides-v1"],
  { tags: [COPY_OVERRIDES_TAG], revalidate: false },
);

/** Fail-open read used by the request config: at worst the site ships its own copy. */
export async function readCopyOverrides(): Promise<CopyOverrides> {
  return (await loadOverridesCached()).overrides;
}

/** The same read with the outcome kept, for the panel and for diagnostics. */
export async function readCopyOverridesReport(): Promise<{
  overrides: CopyOverrides;
  status: CopyReadStatus;
}> {
  return loadOverridesCached();
}

/** One locale's overrides; the merge layer only ever needs this. */
export async function readCopyOverridesFor(locale: string): Promise<CopyLocaleOverrides> {
  return (await readCopyOverrides())[locale] ?? {};
}

/** The shipped copy of one locale, flattened to editable keys only. */
export async function readCopyOriginals(locale: string): Promise<Record<string, string>> {
  return collectCopyOriginals(await loadRawMessages(locale));
}

/** Shipped copy with the overlay applied, flattened: what the panel shows as current. */
export async function readCopyEffectiveValues(locale: string): Promise<Record<string, string>> {
  const [originals, overrides] = await Promise.all([
    readCopyOriginals(locale),
    readCopyOverridesFor(locale),
  ]);
  const values: Record<string, string> = { ...originals };
  for (const [key, value] of Object.entries(overrides)) {
    if (key in values) values[key] = value;
  }
  return values;
}

/** The rows of one group for the panel; `undefined` group means "not found". */
export async function readCopyGroupRows(
  locale: string,
  groupId: string,
): Promise<CopyRow[] | null> {
  const group = findCopyGroup(groupId);
  if (!group) return null;
  const [originals, overrides] = await Promise.all([
    readCopyOriginals(locale),
    readCopyOverridesFor(locale),
  ]);
  return copyGroupRows(group, originals, overrides);
}

/* --------------------------------------------------------------- transport */

/**
 * Reads the current document before any mutation. A read that fails throws -
 * `not_configured` or `unavailable` - instead of writing, so saving one language
 * can never replace the other twelve with an empty document.
 */
async function readForWrite(): Promise<CopyOverrides> {
  if (!storageConfigured()) throw new CopyError("not_configured");
  try {
    return await loadOverrides();
  } catch (error) {
    console.error("copy overrides could not be read before writing", error);
    throw new CopyError("unavailable");
  }
}

async function writeOverrides(overrides: CopyOverrides): Promise<void> {
  if (!storageConfigured()) throw new CopyError("not_configured");
  const document: CopyDocument = {
    version: 1,
    updatedAt: new Date().toISOString(),
    // Locales with no override left are dropped, so the document stays sparse and
    // "restore everything" really does empty a language out.
    overrides,
  };
  try {
    await writeDocument(COPY_OVERRIDES_PATH, `${JSON.stringify(document, null, 2)}\n`);
  } catch (error) {
    console.error("copy overrides could not be written", error);
    throw new CopyError("unavailable");
  }
}

/* -------------------------------------------------------------- public API */

export type CopySaveResult = {
  locale: string;
  /** Keys that now have an override. */
  saved: number;
  /** Keys whose override was removed because the value is the shipped copy again. */
  restored: number;
  /** True when the document was written; false when nothing had changed. */
  written: boolean;
};

/**
 * Validates, diffs and stores one locale's overrides.
 *
 * Every entry is checked against the namespace whitelist and the length cap
 * before storage is touched, and every entry equal to the shipped copy is
 * dropped instead of stored. The plan is computed over the *whole* document so a
 * save only rewrites its own locale.
 */
export async function saveCopyLocale(input: unknown): Promise<CopySaveResult> {
  const patch = parseCopyPatch(input, appLocales);

  // The shipped copy is a compile-time import, not a store read: a bad value can
  // be rejected before the document is even fetched.
  const originals = await readCopyOriginals(patch.locale);
  const plan = planCopyEntries(patch.entries, originals);

  const current = await readForWrite();
  const before = current[patch.locale] ?? {};
  const after = applyCopyPlan(before, plan);

  const result: CopySaveResult = {
    locale: patch.locale,
    saved: Object.keys(after).length,
    // Only entries that actually had an override are "restored"; typing the
    // shipped text into an untouched row is a no-op, not a restore.
    restored: plan.remove.filter((key) => key in before).length,
    written: false,
  };
  if (copyOverridesEqual(before, after)) return result;

  const next: CopyOverrides = { ...current };
  if (Object.keys(after).length > 0) next[patch.locale] = after;
  else delete next[patch.locale];
  await writeOverrides(next);
  return { ...result, written: true };
}

/**
 * The Chinese source the translate button works from: shipped copy with the
 * Chinese overrides applied. Translation reads the *saved* Chinese, so the
 * operator confirms the Chinese first and translates afterwards.
 */
export async function readChineseCopy(keys: readonly string[]): Promise<Record<string, string>> {
  const values = await readCopyEffectiveValues("zh");
  const source: Record<string, string> = {};
  for (const key of keys) {
    const value = values[key];
    if (typeof value === "string" && value.trim()) source[key] = value;
  }
  return source;
}

/** Keys of one group, in message order, for the translate request. */
export async function readCopyGroupKeys(groupId: string): Promise<string[]> {
  const group = findCopyGroup(groupId);
  if (!group) return [];
  const originals = await readCopyOriginals("zh");
  const namespaces = group.namespaces as readonly string[];
  return Object.keys(originals).filter((key) => namespaces.includes(copyKeyNamespace(key)));
}

/**
 * Normalises a translate request into the keys to translate. Both the group and
 * an explicit key list are accepted; every key still has to be editable, and the
 * result is capped so one request cannot fan out without bound.
 */
export function resolveTranslateKeys(
  input: Record<string, unknown>,
  groupKeys: readonly string[],
): { locale: string; keys: string[] } {
  const locale = typeof input.locale === "string" ? input.locale.trim() : "";
  if (!appLocales.includes(locale as (typeof appLocales)[number])) {
    throw new CopyError("invalid_locale", locale);
  }
  // The source language is Chinese; translating Chinese into Chinese is a no-op.
  if (locale === "zh") throw new CopyError("invalid_target", locale);

  const requested = Array.isArray(input.keys)
    ? input.keys.filter((key): key is string => typeof key === "string").slice(0, 200)
    : groupKeys.slice(0, 200);
  if (requested.length === 0) throw new CopyError("empty");

  const keys: string[] = [];
  for (const key of requested) {
    if (!isEditableCopyKey(key)) throw new CopyError("invalid_key", key);
    keys.push(key);
  }
  return { locale, keys };
}
