import { createCipheriv, createDecipheriv, hkdfSync, randomBytes, randomUUID } from "node:crypto";
import { unstable_cache } from "next/cache";
import { del, list, put } from "@vercel/blob";
import type { Product, ProductSpec } from "@/lib/data/products";

/**
 * Operator edits live in an overlay document, never in the product seed. The
 * seed stays in code exactly as it was imported, so a restore is "delete the
 * override" rather than a data rebuild.
 */
export const PRODUCT_OVERRIDES_PATH = "content/products.json";

/** Immutable per-write copies; the newest one is authoritative. */
const SNAPSHOT_PREFIX = "content/products/";
const SNAPSHOT_KEEP = 5;

/**
 * Tag on the fetch that reads the overlay, so a save can expire it explicitly
 * in addition to the per-path revalidation.
 */
export const PRODUCT_OVERRIDES_TAG = "product-overrides";

/** The store is public, so every read and write goes through this budget. */
const READ_TIMEOUT_MS = 5000;

const NAME_MAX = 200;
const DESCRIPTION_MAX = 2000;
const SPEC_VALUE_MAX = 200;
const SPEC_LABEL_MAX = 60;
const SPEC_ROWS_MAX = 40;
const PRICE_NOTE_MAX = 200;

/** Above this a product price is almost certainly a typo, not a price. */
export const PRICE_MAX = 10_000_000;

export const productCurrencies = ["USD", "CNY", "RMB"] as const;

export type ProductCurrency = (typeof productCurrencies)[number];

/** Prices are internal: they exist in the admin panel only, never on the site. */
export type ProductPrice = {
  amount: number;
  currency: ProductCurrency;
  note?: string;
};

export type LocalizedText = { en?: string; zh?: string };

export type ProductOverride = {
  name?: LocalizedText;
  description?: LocalizedText;
  price?: ProductPrice;
  inStock?: boolean;
  /** Delisted: the public loaders drop the product, the data stays. */
  hidden?: boolean;
  specs?: ProductSpec[];
};

export type Overrides = Record<string, ProductOverride>;

export type OverrideDocument = {
  version: 1;
  updatedAt: string;
  overrides: Overrides;
};

/** Raised for request-level problems; the code becomes the API error string. */
export class ProductStoreError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "ProductStoreError";
  }
}

/** A public product merged with its override; `price` must be stripped. */
export type CatalogProduct = Product & { price?: ProductPrice };

/* ------------------------------------------------------------------ crypto */

/**
 * The same secret that protects the admin accounts. A dedicated HKDF salt and
 * info string keep the two keys independent: leaking one does not open the
 * other, even though both derive from ADMIN_SESSION_SECRET.
 */
function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.FACTORY_VIDEO_PASSWORD?.trim() ||
    ""
  );
}

export function productStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function productOverridesConfigured() {
  return sessionSecret().length >= 8 && productStorageConfigured();
}

function encryptionKey(): Buffer {
  const secret = sessionSecret();
  if (secret.length < 8) throw new ProductStoreError("not_configured");
  return Buffer.from(
    hkdfSync("sha256", secret, "songyu-product-salt", "product-overrides-v1", 32),
  );
}

/**
 * The Blob store backing this project is public, so the overlay leaves the
 * server encrypted: iv | auth tag | ciphertext. Prices therefore never sit at a
 * readable URL, and the document is useless without the deployment secret.
 */
function encode(document: OverrideDocument) {
  const key = encryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(document), "utf8"), cipher.final()]);
  // A Buffer's ArrayBufferLike does not satisfy BlobPart, so copy into a plain view.
  return new Blob([new Uint8Array(Buffer.concat([iv, cipher.getAuthTag(), body]))]);
}

function decode(payload: Buffer): Overrides {
  const key = encryptionKey();
  const decipher = createDecipheriv("aes-256-gcm", key, payload.subarray(0, 12));
  decipher.setAuthTag(payload.subarray(12, 28));
  const json = Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8");
  const data = JSON.parse(json) as { overrides?: unknown };
  if (typeof data.overrides !== "object" || data.overrides === null) {
    throw new Error("product overrides are malformed");
  }
  return data.overrides as Overrides;
}

/* --------------------------------------------------------------- transport */

type BlobRef = { url: string; pathname: string; uploadedAt: Date };

/** Newest first; the pathname breaks ties between writes in the same millisecond. */
function newestFirst(a: BlobRef, b: BlobRef) {
  return b.uploadedAt.getTime() - a.uploadedAt.getTime() || b.pathname.localeCompare(a.pathname);
}

async function fetchOverrides(url: string): Promise<Overrides> {
  // Public Blobs are CDN-cached for at least a minute and cacheControlMaxAge
  // cannot go below 60 seconds, so a document read back from a stable pathname
  // is the previous version. Snapshots are therefore written to a fresh,
  // immutable pathname and the newest one - found through list(), whose
  // metadata is always current - is authoritative.
  const response = await fetch(url, { signal: AbortSignal.timeout(READ_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`product overrides could not be read (${response.status})`);
  }
  return decode(Buffer.from(await response.arrayBuffer()));
}

/** null only when no overlay document exists yet. Throws when it cannot be read. */
async function loadOverrides(): Promise<Overrides | null> {
  if (!productStorageConfigured()) return null;
  const signal = AbortSignal.timeout(READ_TIMEOUT_MS);
  const { blobs } = await list({ prefix: SNAPSHOT_PREFIX, limit: 200, abortSignal: signal });
  const newest = blobs.slice().sort(newestFirst)[0];
  if (newest) return fetchOverrides(newest.url);

  const { blobs: canonical } = await list({
    prefix: PRODUCT_OVERRIDES_PATH,
    limit: 1,
    abortSignal: signal,
  });
  const found = canonical.find((blob) => blob.pathname === PRODUCT_OVERRIDES_PATH);
  return found ? fetchOverrides(found.url) : null;
}

async function writeOverrideDocument(overrides: Overrides) {
  if (!productStorageConfigured()) throw new ProductStoreError("not_configured");
  // Encoding twice gives each object its own iv, which a shared ciphertext would reuse.
  const document: OverrideDocument = {
    version: 1,
    updatedAt: new Date().toISOString(),
    overrides,
  };
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  await put(`${SNAPSHOT_PREFIX}${stamp}-${randomUUID()}.json`, encode(document), {
    access: "public", // the object itself is ciphertext; the store is public
    contentType: "application/octet-stream",
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });
  await put(PRODUCT_OVERRIDES_PATH, encode(document), {
    access: "public",
    contentType: "application/octet-stream",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
  await pruneSnapshots();
}

/** Housekeeping only: a failed prune must never fail the write that caused it. */
async function pruneSnapshots() {
  try {
    const { blobs } = await list({ prefix: SNAPSHOT_PREFIX, limit: 200 });
    if (blobs.length <= SNAPSHOT_KEEP) return;
    const stale = blobs
      .slice()
      .sort(newestFirst)
      .slice(SNAPSHOT_KEEP)
      .map((blob) => blob.url);
    if (stale.length > 0) await del(stale);
  } catch (error) {
    console.error("product override snapshot prune failed", error);
  }
}

/* -------------------------------------------------------------- public API */

export type OverlayReadStatus = "" | "not_configured" | "unreadable";

/**
 * One overlay read per render tree, reused across requests until a save or a
 * path revalidation expires it.
 *
 * A strictly request-scoped read does not survive a 4,225-page build: every
 * prerendered page would call list() on the Blob API, which rate-limits long
 * before the build finishes, and every page would then quietly render seed
 * data (measured: the build hit "Too many requests" from Blob). The data cache
 * is the right home for this document - it is one small object shared by the
 * whole catalogue - and every save calls revalidateTag(PRODUCT_OVERRIDES_TAG),
 * so an edit is never missed: the matching revalidatePath() calls regenerate
 * the pages and the tag expires this entry. A failed read is cached as well, so
 * one outage does not turn into one retry per page.
 */
const loadOverridesCached = unstable_cache(
  async (): Promise<{ overrides: Overrides; status: OverlayReadStatus }> => {
    if (!productOverridesConfigured()) return { overrides: {}, status: "not_configured" };
    try {
      return { overrides: (await loadOverrides()) ?? {}, status: "" };
    } catch (error) {
      console.error(
        "product overrides could not be read; falling back to the seed catalogue",
        error,
      );
      return { overrides: {}, status: "unreadable" };
    }
  },
  ["product-overrides-v1"],
  { tags: [PRODUCT_OVERRIDES_TAG], revalidate: false },
);

/**
 * Fail-open read used by every public page: an unreadable, undecryptable or
 * slow overlay renders the seed catalogue instead. A broken overlay must never
 * turn a product page into a 500.
 */
export async function readOverrides(): Promise<Overrides> {
  return (await readOverridesReport()).overrides;
}

/**
 * Same read, with the outcome kept. The admin list uses it to say "the overlay
 * could not be read" instead of quietly showing every product as unedited,
 * which is what a fail-open read looks like from the inside.
 */
export async function readOverridesReport(): Promise<{
  overrides: Overrides;
  status: OverlayReadStatus;
}> {
  return loadOverridesCached();
}

/**
 * Writes the whole document. Deliberately thin: callers go through
 * saveOverride(), which reads the current document first.
 */
export async function writeOverrides(overrides: Overrides): Promise<void> {
  if (!productOverridesConfigured()) throw new ProductStoreError("not_configured");
  await writeOverrideDocument(overrides);
}

/**
 * Read-modify-write of one slug. A read failure throws instead of writing: the
 * panel must not replace every other product's edits with an empty document.
 */
export async function saveOverride(slug: string, override: ProductOverride): Promise<void> {
  if (!productOverridesConfigured()) throw new ProductStoreError("not_configured");
  let current: Overrides;
  try {
    current = (await loadOverrides()) ?? {};
  } catch (error) {
    console.error("product overrides could not be read before writing", error);
    throw new ProductStoreError("unavailable");
  }
  const next: Overrides = { ...current };
  if (Object.keys(override).length === 0) delete next[slug];
  else next[slug] = override;
  await writeOverrideDocument(next);
}

export function hasOverride(overrides: Overrides, slug: string) {
  return Boolean(overrides[slug]);
}

/* ---------------------------------------------------------------- overlay */

function mergeText(base: { en: string; zh: string }, patch: LocalizedText) {
  return {
    en: patch.en?.trim() ? patch.en : base.en,
    zh: patch.zh?.trim() ? patch.zh : base.zh,
  };
}

function copySpecs(specs: ProductSpec[]): ProductSpec[] {
  return specs.map((spec) => ({ labelKey: spec.labelKey, value: { ...spec.value } }));
}

/**
 * Stacks one override on top of a seed product. Every field is optional, so an
 * override that only changes the price leaves the copy untouched.
 *
 * Specs replace the seed rows wholesale and are mirrored into technicalSpecs:
 * the catalogue card reads `specs` and the product page table reads
 * `technicalSpecs`, so an operator editing one table has to see the result in
 * both places.
 */
export function applyOverride(product: Product, override?: ProductOverride): CatalogProduct {
  if (!override) return product;
  const next: CatalogProduct = { ...product };
  if (override.name) next.name = mergeText(product.name, override.name);
  if (override.description) {
    next.description = mergeText(product.description, override.description);
  }
  if (typeof override.inStock === "boolean") next.inStock = override.inStock;
  if (override.specs) {
    next.specs = copySpecs(override.specs);
    next.technicalSpecs = copySpecs(override.specs);
  }
  if (override.price) next.price = { ...override.price };
  return next;
}

/* ------------------------------------------------------------- validation */

/** The shape the edit form sends; validated here, never trusted from the client. */
export type ProductOverridePatch = {
  name?: LocalizedText;
  description?: LocalizedText;
  price?: ProductPrice | null;
  inStock?: boolean;
  hidden?: boolean;
  specs?: ProductSpec[];
};

function text(value: unknown, max: number, code: string) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new ProductStoreError(code);
  // Control characters and angle brackets are stripped for the same reason the
  // admin account names strip them: the value is rendered, never parsed.
  const cleaned = value.replace(/[\u0000-\u001f<>]/g, "").trim();
  if (cleaned.length > max) throw new ProductStoreError(code);
  return cleaned;
}

function localisedText(value: unknown, max: number, code: string): LocalizedText | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "object") throw new ProductStoreError(code);
  const input = value as Record<string, unknown>;
  const en = text(input.en, max, code);
  const zh = text(input.zh, max, code);
  if (en === undefined && zh === undefined) return undefined;
  const next: LocalizedText = {};
  if (en) next.en = en;
  if (zh) next.zh = zh;
  return Object.keys(next).length > 0 ? next : undefined;
}

function specRows(value: unknown): ProductSpec[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new ProductStoreError("invalid_specs");
  if (value.length > SPEC_ROWS_MAX) throw new ProductStoreError("invalid_specs");
  const rows: ProductSpec[] = [];
  for (const row of value) {
    if (typeof row !== "object" || row === null) throw new ProductStoreError("invalid_specs");
    const item = row as Record<string, unknown>;
    // The labelKey is looked up in the message catalogue before it is rendered,
    // so it has to stay a plain identifier rather than arbitrary text.
    const labelKey = text(item.labelKey, SPEC_LABEL_MAX, "invalid_specs");
    if (!labelKey || !/^[A-Za-z][A-Za-z0-9_]*$/.test(labelKey)) {
      throw new ProductStoreError("invalid_specs");
    }
    const value = localisedText(item.value, SPEC_VALUE_MAX, "invalid_specs");
    if (!value?.en && !value?.zh) continue; // an empty row is a row the operator is still adding
    rows.push({ labelKey, value: { en: value.en ?? value.zh ?? "", zh: value.zh ?? value.en ?? "" } });
  }
  return rows;
}

function priceValue(value: unknown): ProductPrice | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "object") throw new ProductStoreError("invalid_price");
  const input = value as Record<string, unknown>;
  const amount = typeof input.amount === "number" ? input.amount : Number.NaN;
  if (!Number.isFinite(amount) || amount < 0 || amount > PRICE_MAX) {
    throw new ProductStoreError("invalid_price");
  }
  const currency = input.currency;
  if (typeof currency !== "string" || !(productCurrencies as readonly string[]).includes(currency)) {
    throw new ProductStoreError("invalid_price");
  }
  const note = text(input.note, PRICE_NOTE_MAX, "invalid_price");
  const price: ProductPrice = { amount, currency: currency as ProductCurrency };
  if (note) price.note = note;
  return price;
}

/** Validates the form payload; throws ProductStoreError with a code the API maps to a status. */
export function sanitizePatch(input: unknown): ProductOverridePatch {
  if (typeof input !== "object" || input === null) throw new ProductStoreError("invalid_patch");
  const body = input as Record<string, unknown>;
  const patch: ProductOverridePatch = {};
  const name = localisedText(body.name, NAME_MAX, "invalid_name");
  if (name) patch.name = name;
  const description = localisedText(body.description, DESCRIPTION_MAX, "invalid_description");
  if (description) patch.description = description;
  const price = priceValue(body.price);
  if (price !== undefined) patch.price = price;
  if (typeof body.inStock === "boolean") patch.inStock = body.inStock;
  if (typeof body.hidden === "boolean") patch.hidden = body.hidden;
  const specs = specRows(body.specs);
  if (specs !== undefined) patch.specs = specs;
  return patch;
}

function sameSpecs(left: ProductSpec[], right: ProductSpec[]) {
  if (left.length !== right.length) return false;
  return left.every((row, index) => {
    const other = right[index];
    return (
      row.labelKey === other.labelKey &&
      row.value.en === other.value.en &&
      row.value.zh === other.value.zh
    );
  });
}

/**
 * Turns a validated patch into the stored override, keeping only what actually
 * differs from the seed. An untouched field must not be frozen into the
 * document: it would keep an old name after the seed is fixed, and it would
 * flag every opened product as "已改" in the admin list.
 */
export function buildOverride(product: Product, patch: ProductOverridePatch): ProductOverride {
  const override: ProductOverride = {};

  if (patch.name) {
    const name: LocalizedText = {};
    if (patch.name.en && patch.name.en !== product.name.en) name.en = patch.name.en;
    if (patch.name.zh && patch.name.zh !== product.name.zh) name.zh = patch.name.zh;
    if (Object.keys(name).length > 0) override.name = name;
  }

  if (patch.description) {
    const description: LocalizedText = {};
    if (patch.description.en && patch.description.en !== product.description.en) {
      description.en = patch.description.en;
    }
    if (patch.description.zh && patch.description.zh !== product.description.zh) {
      description.zh = patch.description.zh;
    }
    if (Object.keys(description).length > 0) override.description = description;
  }

  if (patch.price) override.price = patch.price;
  if (typeof patch.inStock === "boolean" && patch.inStock !== product.inStock) {
    override.inStock = patch.inStock;
  }
  if (patch.hidden === true) override.hidden = true;
  if (patch.specs && !sameSpecs(patch.specs, product.specs)) override.specs = patch.specs;

  return override;
}
