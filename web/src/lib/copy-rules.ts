/**
 * The site copy overlay document, its rules, and nothing else.
 *
 * Like `announcement-rules.ts` this module deliberately has no imports: the half
 * that validates and merges runs in the admin client component as well as on the
 * server, so it must not reach for storage, Node built-ins or the admin session.
 * `src/lib/copy.ts` adds the storage layer on top.
 *
 * The overlay never replaces `messages/<locale>.json`. It is a sparse map of
 * `locale -> message key -> text` layered on top at request time, so removing an
 * entry is exactly "back to the original". That is why the write path prunes
 * every entry that equals the shipped value instead of storing it.
 *
 * Only the namespaces in COPY_NAMESPACES are reachable. Policy pages (terms,
 * privacy, payment, shipping) are excluded because their wording is a legal
 * commitment, and `meta` because it feeds SEO; the list below is the single
 * source of truth for the form, the API and the stored document alike.
 */

/** Editable namespaces: marketing and navigation copy only. */
export const COPY_NAMESPACES = [
  "home",
  "about",
  "contact",
  "quality",
  "footer",
  "nav",
  "catalog",
  "quote",
] as const;

export type CopyNamespace = (typeof COPY_NAMESPACES)[number];

/**
 * Namespaces the panel must never expose. They are not in COPY_NAMESPACES, so
 * they are already refused; this list exists so the exclusions are documented in
 * code and can be asserted by the checks. `product` and `video` are absent too:
 * product copy is edited through the product overlay, not here.
 */
export const COPY_EXCLUDED_NAMESPACES = [
  "terms",
  "privacy",
  "payment",
  "shipping",
  "meta",
  "lang",
  "common",
  "product",
  "video",
] as const;

/** One entry is a sentence or a label, not a page of prose. */
export const COPY_VALUE_MAX = 400;

/** A whole group is at most a few hundred keys; this bounds one request. */
export const COPY_ENTRIES_MAX = 500;

/** The panel groups the namespaces into the six sections an operator recognises. */
export type CopyGroup = {
  id: string;
  label: string;
  /** Which namespaces the group edits, in display order. */
  namespaces: readonly CopyNamespace[];
  hint: string;
};

export const COPY_GROUPS: readonly CopyGroup[] = [
  {
    id: "home",
    label: "首页",
    namespaces: ["home"],
    hint: "首页首屏、分类卡片、工厂与询盘区块的标题与说明。",
  },
  {
    id: "about",
    label: "关于我们",
    namespaces: ["about"],
    hint: "关于页正文与按钮。",
  },
  {
    id: "contact",
    label: "联系我们",
    namespaces: ["contact"],
    hint: "联系页标签与说明。",
  },
  {
    id: "quality",
    label: "品质与物流",
    namespaces: ["quality"],
    hint: "质检与海运 / 陆运说明段落。",
  },
  {
    id: "footer",
    label: "页脚",
    namespaces: ["footer"],
    hint: "页脚标语与各列链接名（政策链接的名称可以改，政策正文不能）。",
  },
  {
    id: "nav",
    label: "导航与按钮",
    namespaces: ["nav", "catalog", "quote"],
    hint: "导航菜单、产品目录筛选与询价/报价页的按钮标签。",
  },
];

export type CopyLocaleOverrides = Record<string, string>;

export type CopyOverrides = Record<string, CopyLocaleOverrides>;

/** The stored shape, one plain JSON row of `songyu_documents`. */
export type CopyDocument = {
  version: 1;
  updatedAt: string;
  overrides: CopyOverrides;
};

/** One row of the panel: a key, what the site shipped, what is showing now. */
export type CopyRow = {
  key: string;
  namespace: string;
  original: string;
  value: string;
  /** True when `value` differs from `original`, i.e. an override is in effect. */
  overridden: boolean;
};

/** Raised for request-level problems; the code becomes the API error string. */
export class CopyError extends Error {
  constructor(
    readonly code: string,
    readonly detail = "",
  ) {
    super(detail ? `${code}: ${detail}` : code);
    this.name = "CopyError";
  }
}

/**
 * HTTP status per error code, shared by both admin routes so the client can map
 * one code to one Chinese sentence.
 */
export const COPY_ERROR_STATUS: Record<string, number> = {
  invalid_body: 400,
  invalid_locale: 400,
  invalid_key: 400,
  unknown_key: 400,
  invalid_value: 400,
  too_long: 400,
  empty: 400,
  too_many_entries: 400,
  invalid_target: 400,
  translate_failed: 502,
  not_configured: 503,
  unavailable: 503,
};

/* ------------------------------------------------------------------ keys */

/**
 * Control characters and angle brackets are stripped everywhere else in this
 * codebase: the value is rendered as text, never parsed as markup.
 */
function clean(value: string) {
  return value.replace(/[\u0000-\u001f\u007f<>]/g, "");
}

/** The namespace of a message key (`home.heroTitle` -> `home`), or "" if malformed. */
export function copyKeyNamespace(key: string): string {
  const dot = key.indexOf(".");
  if (dot <= 0 || dot === key.length - 1) return "";
  return key.slice(0, dot);
}

/**
 * The whitelist check. A key is editable when its namespace is in
 * COPY_NAMESPACES and it names at least one segment after the dot.
 */
export function isEditableCopyKey(key: unknown): key is string {
  if (typeof key !== "string") return false;
  if (key.length > 120) return false;
  const namespace = copyKeyNamespace(key);
  return (COPY_NAMESPACES as readonly string[]).includes(namespace);
}

/** True when the key belongs to the given group. */
export function isCopyKeyInGroup(key: string, group: CopyGroup) {
  return (group.namespaces as readonly string[]).includes(copyKeyNamespace(key));
}

export function findCopyGroup(id: string): CopyGroup | undefined {
  return COPY_GROUPS.find((group) => group.id === id);
}

export function findCopyGroupForKey(key: string): CopyGroup | undefined {
  return COPY_GROUPS.find((group) => isCopyKeyInGroup(key, group));
}

/* ----------------------------------------------------------------- values */

/** Cleaned and trimmed text; throws `invalid_value` / `too_long`. */
export function sanitizeCopyValue(value: unknown, key: string): string {
  if (typeof value !== "string") throw new CopyError("invalid_value", key);
  const cleaned = clean(value).trim();
  if (cleaned.length > COPY_VALUE_MAX) throw new CopyError("too_long", key);
  return cleaned;
}

/**
 * The patch the form sends: one locale plus the keys that locale edits. Only the
 * namespace whitelist is enforced here; the length rule runs in planCopyEntries,
 * which is the one place every write goes through.
 */
export type CopyPatch = { locale: string; entries: Record<string, string> };

export function parseCopyPatch(input: unknown, locales: readonly string[]): CopyPatch {
  if (typeof input !== "object" || input === null) throw new CopyError("invalid_body");
  const body = input as Record<string, unknown>;

  const locale = typeof body.locale === "string" ? body.locale.trim() : "";
  if (!locales.includes(locale)) throw new CopyError("invalid_locale", locale);

  const raw = body.entries;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new CopyError("invalid_body");
  }
  const keys = Object.keys(raw);
  if (keys.length === 0) throw new CopyError("empty");
  if (keys.length > COPY_ENTRIES_MAX) throw new CopyError("too_many_entries");

  const entries: Record<string, string> = {};
  for (const key of keys) {
    // The server checks the namespace here, before anything is read or written.
    // The form hides the excluded namespaces, but that is only a convenience.
    if (!isEditableCopyKey(key)) throw new CopyError("invalid_key", key);
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value !== "string") throw new CopyError("invalid_value", key);
    entries[key] = value;
  }
  return { locale, entries };
}

/* ------------------------------------------------------------ write plan */

export type CopyWritePlan = {
  /** Entries that become overrides. */
  keep: Record<string, string>;
  /** Keys whose override has to go back to the shipped copy. */
  remove: string[];
};

/**
 * Turns one group of form values into the override changes to apply.
 *
 * An empty value and a value equal to the shipped copy both mean "restore": the
 * entry is dropped instead of pinned, so a later copy fix in the message files
 * still reaches that locale. A key the locale does not have cannot be overridden,
 * because the merge only replaces existing leaves.
 */
export function planCopyEntries(
  entries: Record<string, string>,
  originals: Record<string, string>,
): CopyWritePlan {
  const keep: Record<string, string> = {};
  const remove: string[] = [];
  for (const [key, raw] of Object.entries(entries)) {
    if (!isEditableCopyKey(key)) throw new CopyError("invalid_key", key);
    const value = sanitizeCopyValue(raw, key);
    const original = originals[key];
    if (typeof original !== "string") throw new CopyError("unknown_key", key);
    if (!value || value === original) {
      remove.push(key);
      continue;
    }
    keep[key] = value;
  }
  return { keep, remove };
}

/** Applies one plan to one locale's override map (the stored map is not mutated). */
export function applyCopyPlan(
  current: CopyLocaleOverrides,
  plan: CopyWritePlan,
): CopyLocaleOverrides {
  const next: CopyLocaleOverrides = { ...current };
  for (const key of plan.remove) delete next[key];
  for (const [key, value] of Object.entries(plan.keep)) next[key] = value;
  return next;
}

/** Order-insensitive comparison, so an unchanged save does not touch the document. */
export function copyOverridesEqual(left: CopyLocaleOverrides, right: CopyLocaleOverrides) {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  if (leftKeys.length !== rightKeys.length) return false;
  for (let index = 0; index < leftKeys.length; index += 1) {
    const key = leftKeys[index];
    if (key !== rightKeys[index]) return false;
    if (left[key] !== right[key]) return false;
  }
  return true;
}

/* --------------------------------------------------------------- storage */

/**
 * A stored body back to overrides, tolerantly. A corrupt document, a wrong
 * shape, an unknown locale, a non-whitelisted key and an oversized value are all
 * dropped rather than thrown: an unreadable overlay must never break the site.
 */
export function parseCopyDocument(
  body: string,
  locales: readonly string[],
): CopyOverrides {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null) return {};
  const raw = (parsed as Record<string, unknown>).overrides;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};

  const overrides: CopyOverrides = {};
  for (const [locale, entries] of Object.entries(raw as Record<string, unknown>)) {
    if (!locales.includes(locale)) continue;
    if (typeof entries !== "object" || entries === null || Array.isArray(entries)) continue;
    const cleanEntries: CopyLocaleOverrides = {};
    for (const [key, value] of Object.entries(entries as Record<string, unknown>)) {
      // A hand-edited document must not be able to smuggle `terms.*` in either.
      if (!isEditableCopyKey(key)) continue;
      if (typeof value !== "string") continue;
      const cleaned = clean(value).trim();
      if (!cleaned || cleaned.length > COPY_VALUE_MAX) continue;
      cleanEntries[key] = cleaned;
    }
    if (Object.keys(cleanEntries).length > 0) overrides[locale] = cleanEntries;
  }
  return overrides;
}

/* ---------------------------------------------------------------- merge */

/**
 * The shipped copy of one locale, flattened to `namespace.key` -> text, limited
 * to the editable namespaces. Non-string leaves are skipped: an override is text.
 */
export function collectCopyOriginals(messages: unknown): Record<string, string> {
  const originals: Record<string, string> = {};
  if (typeof messages !== "object" || messages === null) return originals;
  const root = messages as Record<string, unknown>;

  const walk = (prefix: string, node: unknown, depth: number) => {
    if (depth > 4 || typeof node !== "object" || node === null || Array.isArray(node)) return;
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      const path = `${prefix}.${key}`;
      if (typeof value === "string") {
        originals[path] = value;
        continue;
      }
      walk(path, value, depth + 1);
    }
  };

  for (const namespace of COPY_NAMESPACES) walk(namespace, root[namespace], 1);
  return originals;
}

function mergeCopyNode(base: unknown, patch: unknown): unknown {
  // An override is data, not structure: it can replace an existing string leaf
  // and descend into an existing object, and it can never add a key, replace an
  // object with a string or touch an array. That is what keeps a bad overlay from
  // breaking the whole message bundle.
  if (typeof patch !== "object" || patch === null || Array.isArray(patch)) return base;
  if (typeof base !== "object" || base === null || Array.isArray(base)) return base;

  const source = base as Record<string, unknown>;
  const result: Record<string, unknown> = { ...source };
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    const current = source[key];
    if (typeof value === "string") {
      if (typeof current === "string") result[key] = value;
      continue;
    }
    result[key] = mergeCopyNode(current, value);
  }
  return result;
}

/**
 * The stored (and the form's) shape is one flat map of `namespace.key` -> text,
 * so it is expanded into the nested tree the message bundle has. Keys outside
 * the whitelist are dropped here as well: the merge is the last line of defence,
 * and it does not trust the map it is handed.
 */
function expandCopyOverrides(overrides: CopyLocaleOverrides): Record<string, unknown> {
  const tree: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(overrides)) {
    if (typeof value !== "string") continue;
    if (!isEditableCopyKey(key)) continue;
    const parts = key.split(".");
    let node = tree;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const part = parts[index];
      const next = node[part];
      if (typeof next !== "object" || next === null) node[part] = {};
      node = node[part] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = value;
  }
  return tree;
}

/**
 * The messages a request renders: the shipped bundle with this locale's
 * overrides layered on top. Missing keys keep the shipped text, and the shipped
 * objects are never mutated, so `unstable_cache`d copies stay clean.
 */
export function applyCopyOverrides<T>(messages: T, overrides: unknown): T {
  if (typeof overrides !== "object" || overrides === null || Array.isArray(overrides)) {
    return messages;
  }
  const localeOverrides = overrides as CopyLocaleOverrides;
  if (Object.keys(localeOverrides).length === 0) return messages;
  return mergeCopyNode(messages, expandCopyOverrides(localeOverrides)) as T;
}

/* ----------------------------------------------------------------- panel */

/**
 * The rows the panel shows for one group and locale, in message-file order.
 * Keys the locale does not carry are skipped: they cannot be overridden.
 */
export function copyGroupRows(
  group: CopyGroup,
  originals: Record<string, string>,
  overrides: CopyLocaleOverrides,
): CopyRow[] {
  const rows: CopyRow[] = [];
  for (const namespace of group.namespaces) {
    const prefix = `${namespace}.`;
    for (const [key, original] of Object.entries(originals)) {
      if (!key.startsWith(prefix)) continue;
      const override = overrides[key];
      const value = typeof override === "string" ? override : original;
      rows.push({ key, namespace, original, value, overridden: value !== original });
    }
  }
  return rows;
}
