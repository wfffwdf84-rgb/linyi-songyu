import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { unstable_cache } from "next/cache";
import { isSupabaseMediaHost, readDocument, storageConfigured, writeDocument } from "@/lib/supabase";
import { cleanOemNumbers, sameOemNumbers } from "@/lib/oem-numbers";
import type { Product, ProductSpec } from "@/lib/data/products";

/**
 * Operator edits live in an overlay document, never in the product seed. The
 * seed stays in code exactly as it was imported, so a restore is "delete the
 * override" rather than a data rebuild.
 *
 * This fixed key is the only copy: it is read as one row of `songyu_documents`
 * and overwritten in place. Snapshot copies were removed along with the list()
 * call that used to find the newest one - list() is an Advanced Operation, and
 * the Blob store was suspended for exceeding that quota.
 */
export const PRODUCT_OVERRIDES_PATH = "content/products.json";

/**
 * Tag on the fetch that reads the overlay, so a save can expire it explicitly
 * in addition to the per-path revalidation.
 */
export const PRODUCT_OVERRIDES_TAG = "product-overrides";

const NAME_MAX = 200;
const DESCRIPTION_MAX = 2000;
const SPEC_VALUE_MAX = 200;
const SPEC_LABEL_MAX = 60;
const SPEC_ROWS_MAX = 40;
const PRICE_NOTE_MAX = 200;
const PART_NUMBER_MAX = 60;
const BRAND_MAX = 80;
const COMPATIBLE_MAX = 400;
const IMAGE_MAX = 500;
/** A product added from the panel is a full record, so the document earns a cap. */
const NEW_PRODUCTS_MAX = 500;

/** Lowercase, 3-80 characters, no leading/trailing dash: a URL segment. */
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{2,79}$/;

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
  /** The photo is editable too: an uploaded Supabase public URL or a /images/... path. */
  image?: string;
  /**
   * OEM cross-reference numbers that replace the seed values. An absent or
   * empty list means "no override": the seed numbers (if any) stay in effect.
   */
  oemNumbers?: string[];
};

export type Overrides = Record<string, ProductOverride>;

/**
 * A product that exists only in the overlay: it has no seed entry, so every
 * field is stored in full rather than as a diff. Editing one still writes an
 * override (diffed against this record), which is what makes "restore" mean the
 * same thing for both kinds of product.
 */
export type NewProduct = Product & {
  /** The primary brand, kept beside `brands` because the form asks for one. */
  brand: string;
  price?: ProductPrice;
  createdAt: string;
  createdBy?: string;
};

/**
 * v2 added `newProducts` and `deletedProducts`, and v1 documents (which only
 * had `overrides`) must still load: a missing array is read as empty.
 */
export type OverrideDocument = {
  version: 2;
  updatedAt: string;
  overrides: Overrides;
  newProducts: NewProduct[];
  deletedProducts: string[];
};

/** The whole overlay as the rest of the app consumes it. */
export type Overlay = {
  overrides: Overrides;
  newProducts: NewProduct[];
  deletedProducts: string[];
};

export const emptyOverlay = (): Overlay => ({
  overrides: {},
  newProducts: [],
  deletedProducts: [],
});

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
  return storageConfigured();
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
 * The overlay is ciphertext - iv | auth tag | ciphertext, base64-encoded into the
 * text body of its row. Prices therefore never sit readable in a database dump,
 * and the document is useless without the deployment secret.
 */
function encode(document: OverrideDocument) {
  const key = encryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(document), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64");
}

/* ------------------------------------------------------- document parsing */

/**
 * Reads a stored document back without trusting it. A field that no longer
 * parses is dropped rather than thrown on: a half-broken overlay must not take
 * the whole catalogue down, and the shape is rewritten on the next save.
 */
function coerceText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f<>]/g, "").slice(0, max).trim();
}

function coerceLocalised(value: unknown, max: number): { en: string; zh: string } {
  const input = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
  const en = coerceText(input.en, max);
  return { en, zh: coerceText(input.zh, max) || en };
}

function coerceSpecRows(value: unknown): ProductSpec[] {
  if (!Array.isArray(value)) return [];
  const rows: ProductSpec[] = [];
  for (const item of value.slice(0, SPEC_ROWS_MAX)) {
    if (typeof item !== "object" || item === null) continue;
    const row = item as Record<string, unknown>;
    const labelKey = coerceText(row.labelKey, SPEC_LABEL_MAX);
    if (!labelKey) continue;
    rows.push({ labelKey, value: coerceLocalised(row.value, SPEC_VALUE_MAX) });
  }
  return rows;
}

function coercePrice(value: unknown): ProductPrice | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const row = value as Record<string, unknown>;
  const amount = typeof row.amount === "number" ? row.amount : Number.NaN;
  const currency = row.currency;
  if (!Number.isFinite(amount) || amount < 0 || amount > PRICE_MAX) return undefined;
  if (typeof currency !== "string" || !(productCurrencies as readonly string[]).includes(currency)) {
    return undefined;
  }
  const note = coerceText(row.note, PRICE_NOTE_MAX);
  const price: ProductPrice = { amount, currency: currency as ProductCurrency };
  if (note) price.note = note;
  return price;
}

/** One stored product, or null when the record is too broken to render. */
function coerceNewProduct(value: unknown): NewProduct | null {
  if (typeof value !== "object" || value === null) return null;
  const row = value as Record<string, unknown>;
  const slug = coerceText(row.slug, 80).toLowerCase();
  if (!SLUG_PATTERN.test(slug)) return null;
  const partNumber = coerceText(row.partNumber, PART_NUMBER_MAX);
  if (!partNumber) return null;
  const categorySlug = coerceText(row.categorySlug, 80);
  if (!categorySlug) return null;
  const name = coerceLocalised(row.name, NAME_MAX);
  if (!name.en) return null;
  const image = coerceText(row.image, IMAGE_MAX);
  if (!image) return null;

  const brands = Array.isArray(row.brands)
    ? row.brands.map((brand) => coerceText(brand, BRAND_MAX)).filter(Boolean)
    : [];
  const brand = coerceText(row.brand, BRAND_MAX) || brands[0] || "";
  const specs = coerceSpecRows(row.specs);
  const technicalSpecs = coerceSpecRows(row.technicalSpecs);

  const product: NewProduct = {
    slug,
    partNumber,
    brand,
    brands: brands.length > 0 ? brands : brand ? [brand] : [],
    categorySlug,
    name,
    description: coerceLocalised(row.description, DESCRIPTION_MAX),
    image,
    inStock: row.inStock !== false,
    specs,
    technicalSpecs: technicalSpecs.length > 0 ? technicalSpecs : specs,
    compatibleMachines: coerceText(row.compatibleMachines, COMPATIBLE_MAX),
    // A stored list is re-cleaned on read so a hand-edited document cannot
    // introduce a number the admin panel would never have saved.
    oemNumbers: cleanOemNumbers(row.oemNumbers).numbers,
    createdAt: coerceText(row.createdAt, 40) || new Date(0).toISOString(),
  };
  const createdBy = coerceText(row.createdBy, 64);
  if (createdBy) product.createdBy = createdBy;
  const price = coercePrice(row.price);
  if (price) product.price = price;
  return product;
}

function decode(payload: Buffer): Overlay {
  const key = encryptionKey();
  const decipher = createDecipheriv("aes-256-gcm", key, payload.subarray(0, 12));
  decipher.setAuthTag(payload.subarray(12, 28));
  const json = Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8");
  const parsed = JSON.parse(json) as unknown;
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("product overrides are malformed");
  }
  const document = parsed as Record<string, unknown>;
  if (
    typeof document.overrides !== "object" ||
    document.overrides === null ||
    Array.isArray(document.overrides)
  ) {
    throw new Error("product overrides are malformed");
  }

  // v1 documents have no newProducts: reading a missing array as empty is the
  // whole compatibility story. Entries are re-validated one by one so one bad
  // record cannot hide the rest of the document.
  const newProducts: NewProduct[] = [];
  const stored = Array.isArray(document.newProducts)
    ? document.newProducts.slice(0, NEW_PRODUCTS_MAX)
    : [];
  for (const entry of stored) {
    const product = coerceNewProduct(entry);
    if (product && !newProducts.some((item) => item.slug === product.slug)) {
      newProducts.push(product);
    }
  }

  const deletedProducts = Array.isArray(document.deletedProducts)
    ? document.deletedProducts.filter(
        (slug): slug is string => typeof slug === "string" && SLUG_PATTERN.test(slug),
      )
    : [];

  return {
    overrides: document.overrides as Overrides,
    newProducts,
    deletedProducts: [...new Set(deletedProducts)].slice(-NEW_PRODUCTS_MAX),
  };
}

/* --------------------------------------------------------------- transport */

/**
 * null only when no overlay document exists yet. Throws when the store is
 * unreachable or the document cannot be decrypted.
 */
async function loadOverlay(): Promise<Overlay | null> {
  if (!productStorageConfigured()) return null;
  const body = await readDocument(PRODUCT_OVERRIDES_PATH);
  if (body === null) return null;
  return decode(Buffer.from(body, "base64"));
}

async function writeOverrideDocument(overlay: Overlay) {
  if (!productStorageConfigured()) throw new ProductStoreError("not_configured");
  const document: OverrideDocument = {
    // Any read of a v1 document is upgraded on the next write.
    version: 2,
    updatedAt: new Date().toISOString(),
    overrides: overlay.overrides,
    newProducts: overlay.newProducts,
    deletedProducts: overlay.deletedProducts,
  };
  await writeDocument(PRODUCT_OVERRIDES_PATH, encode(document));
}

/* -------------------------------------------------------------- public API */

export type OverlayReadStatus = "" | "not_configured" | "unreadable";

/**
 * One overlay read per render tree, reused across requests until a save or a
 * path revalidation expires it.
 *
 * A strictly request-scoped read does not survive a 4,225-page build: every
 * prerendered page would issue its own query for the overlay document, and one
 * shared row is read thousands of times per build. The data cache is the right
 * home for this document - it is one small row shared by the whole catalogue -
 * and every save calls revalidateTag(PRODUCT_OVERRIDES_TAG), so an edit is never
 * missed: the matching revalidatePath() calls regenerate the pages and the tag
 * expires this entry. A failed read is cached as well, so one outage does not
 * turn into one retry per page.
 *
 * Each cache miss costs exactly one row read, never a prefix scan of the table.
 */
const loadOverlayCached = unstable_cache(
  async (): Promise<{ overlay: Overlay; status: OverlayReadStatus }> => {
    if (!productOverridesConfigured()) {
      return { overlay: emptyOverlay(), status: "not_configured" };
    }
    try {
      return { overlay: (await loadOverlay()) ?? emptyOverlay(), status: "" };
    } catch (error) {
      console.error(
        "product overrides could not be read; falling back to the seed catalogue",
        error,
      );
      // Fail open: the seed catalogue renders, and any product added from the
      // panel is simply absent until the store is readable again.
      return { overlay: emptyOverlay(), status: "unreadable" };
    }
  },
  // v2 because the document gained newProducts: a v1-shaped cached entry must
  // not be reused across a deploy.
  ["product-overrides-v2"],
  { tags: [PRODUCT_OVERRIDES_TAG], revalidate: false },
);

/**
 * Fail-open read used by every public page: an unreadable, undecryptable or
 * slow overlay renders the seed catalogue instead. A broken overlay must never
 * turn a product page into a 500.
 */
export async function readOverlay(): Promise<Overlay> {
  return (await readOverlayReport()).overlay;
}

/**
 * Same read, with the outcome kept. The admin list uses it to say "the overlay
 * could not be read" instead of quietly showing every product as unedited,
 * which is what a fail-open read looks like from the inside.
 */
export async function readOverlayReport(): Promise<{
  overlay: Overlay;
  status: OverlayReadStatus;
}> {
  return loadOverlayCached();
}

/** Pre-v2 callers: the overrides alone. */
export async function readOverrides(): Promise<Overrides> {
  return (await readOverlay()).overrides;
}

/** Pre-v2 callers: the overrides alone, with the read outcome. */
export async function readOverridesReport(): Promise<{
  overrides: Overrides;
  status: OverlayReadStatus;
}> {
  const { overlay, status } = await loadOverlayCached();
  return { overrides: overlay.overrides, status };
}

/**
 * Reads the current document before any mutation. A read failure throws instead
 * of writing: the panel must not replace every other product's edits - or the
 * products themselves - with an empty document.
 */
async function readForWrite(): Promise<Overlay> {
  if (!productOverridesConfigured()) throw new ProductStoreError("not_configured");
  try {
    return (await loadOverlay()) ?? emptyOverlay();
  } catch (error) {
    console.error("product overrides could not be read before writing", error);
    throw new ProductStoreError("unavailable");
  }
}

/**
 * Writes the whole document. Deliberately thin: callers go through the
 * read-modify-write helpers below.
 */
export async function writeOverlay(overlay: Overlay): Promise<void> {
  if (!productOverridesConfigured()) throw new ProductStoreError("not_configured");
  await writeOverrideDocument(overlay);
}

/** Replaces the overrides map, keeping the products the panel has added. */
export async function writeOverrides(overrides: Overrides): Promise<void> {
  const current = await readForWrite();
  await writeOverrideDocument({ ...current, overrides });
}

/**
 * Read-modify-write of one slug. The stored document keeps only the fields that
 * differ from the base product, so reverting every field deletes the override.
 */
export async function saveOverride(slug: string, override: ProductOverride): Promise<void> {
  const current = await readForWrite();
  const overrides: Overrides = { ...current.overrides };
  if (Object.keys(override).length === 0) delete overrides[slug];
  else overrides[slug] = override;
  await writeOverrideDocument({ ...current, overrides });
}

/** Removes one override without touching anything else ("restore original"). */
export async function clearOverride(slug: string): Promise<void> {
  const current = await readForWrite();
  if (!current.overrides[slug]) return;
  const overrides: Overrides = { ...current.overrides };
  delete overrides[slug];
  await writeOverrideDocument({ ...current, overrides });
}

/**
 * Appends a product that has no seed entry. Duplicates are checked against the
 * document here, and against the seed catalogue by the caller, which is the
 * only place that can see the seed.
 */
export async function createNewProduct(
  draft: NewProductDraft,
  createdBy?: string,
): Promise<NewProduct> {
  const current = await readForWrite();
  if (current.newProducts.length >= NEW_PRODUCTS_MAX) {
    throw new ProductStoreError("too_many_products");
  }
  if (current.newProducts.some((product) => product.slug === draft.slug)) {
    throw new ProductStoreError("slug_taken");
  }
  const lowerPart = draft.partNumber.toLowerCase();
  if (current.newProducts.some((product) => product.partNumber.toLowerCase() === lowerPart)) {
    throw new ProductStoreError("part_number_taken");
  }

  const product: NewProduct = {
    ...draft,
    createdAt: new Date().toISOString(),
  };
  if (createdBy) product.createdBy = createdBy;

  // A slug that was deleted before becomes valid again; its tombstone and any
  // leftover override are cleared so the new product starts from its own data.
  const overrides: Overrides = { ...current.overrides };
  delete overrides[product.slug];
  const newProducts = [...current.newProducts, product];
  const deletedProducts = current.deletedProducts.filter((slug) => slug !== product.slug);
  await writeOverrideDocument({ overrides, newProducts, deletedProducts });
  return product;
}

/**
 * Removes a product the panel added. Seed products cannot be deleted this way:
 * they live in code, and hiding one is the supported operation.
 */
export async function deleteNewProduct(slug: string): Promise<void> {
  const current = await readForWrite();
  if (!current.newProducts.some((product) => product.slug === slug)) {
    throw new ProductStoreError("not_found");
  }
  const overrides: Overrides = { ...current.overrides };
  delete overrides[slug];
  const newProducts = current.newProducts.filter((product) => product.slug !== slug);
  // The tombstone records what was removed. Readers also skip a product listed
  // here, so a half-written document cannot resurrect a deleted entry.
  const deletedProducts = [
    ...current.deletedProducts.filter((item) => item !== slug),
    slug,
  ].slice(-NEW_PRODUCTS_MAX);
  await writeOverrideDocument({ overrides, newProducts, deletedProducts });
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
  if (override.image) next.image = override.image;
  if (override.specs) {
    next.specs = copySpecs(override.specs);
    next.technicalSpecs = copySpecs(override.specs);
  }
  if (override.price) next.price = { ...override.price };
  // The override list wins wholesale; an empty list is not an override and the
  // seed numbers stay visible, which is what "清空 = 回到种子值" means.
  if (override.oemNumbers && override.oemNumbers.length > 0) {
    next.oemNumbers = [...override.oemNumbers];
  }
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
  image?: string;
  oemNumbers?: string[];
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

/**
 * The OEM list as the API accepts it. A non-array is a client bug and fails the
 * request; entries that break a rule are dropped individually and reported by
 * the admin form's pre-check, which blocks a save before it reaches this code.
 */
function oemNumberList(value: unknown): string[] {
  if (!Array.isArray(value)) throw new ProductStoreError("invalid_oem_numbers");
  return cleanOemNumbers(value).numbers;
}

/**
 * An image reference: an uploaded Supabase public URL, or a path inside the
 * site. The allowed HTTPS hosts mirror `images.remotePatterns` in next.config.ts,
 * so a saved image can always be rendered by <Image>.
 */
function imageValue(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new ProductStoreError("invalid_image");
  const cleaned = value.replace(/[\u0000-\u001f<>]/g, "").trim();
  if (!cleaned) return undefined;
  if (cleaned.length > IMAGE_MAX) throw new ProductStoreError("invalid_image");
  if (cleaned.startsWith("/")) {
    // Protocol-relative URLs would escape the site and are not images we host.
    if (cleaned.startsWith("//")) throw new ProductStoreError("invalid_image");
    return cleaned;
  }
  let url: URL;
  try {
    url = new URL(cleaned);
  } catch {
    throw new ProductStoreError("invalid_image");
  }
  if (url.protocol !== "https:") throw new ProductStoreError("invalid_image");
  const host = url.hostname.toLowerCase();
  const allowed = host === "lh3.googleusercontent.com" || isSupabaseMediaHost(host);
  if (!allowed) throw new ProductStoreError("invalid_image");
  return cleaned;
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
  const image = imageValue(body.image);
  if (image) patch.image = image;
  if (body.oemNumbers !== undefined) patch.oemNumbers = oemNumberList(body.oemNumbers);
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
  if (patch.image && patch.image !== product.image) override.image = patch.image;
  // An empty list clears the override rather than blanking the seed numbers, so
  // only a non-empty list that actually differs is stored.
  if (
    patch.oemNumbers &&
    patch.oemNumbers.length > 0 &&
    !sameOemNumbers(patch.oemNumbers, product.oemNumbers ?? [])
  ) {
    override.oemNumbers = [...patch.oemNumbers];
  }

  return override;
}

/* ---------------------------------------------------- new product validation */

/** A product the panel adds; the storage record plus its creation stamp. */
export type NewProductDraft = Omit<NewProduct, "createdAt" | "createdBy">;

export type NewProductConstraints = {
  /** Slugs and part numbers already in the seed catalogue. */
  seedSlugs?: ReadonlySet<string>;
  seedPartNumbers?: ReadonlySet<string>;
  categorySlugs: ReadonlySet<string>;
};

function requiredSlug(value: unknown): string {
  const slug = text(value, 80, "invalid_slug");
  if (!slug) throw new ProductStoreError("invalid_slug");
  const normalized = slug.toLowerCase();
  if (!SLUG_PATTERN.test(normalized)) throw new ProductStoreError("invalid_slug");
  return normalized;
}

/**
 * The create form, validated in full. Uniqueness against the seed is the
 * caller's job (only the catalogue can see the seed); uniqueness inside the
 * document is enforced again by createNewProduct() under the same read.
 */
export function sanitizeNewProduct(
  input: unknown,
  constraints: NewProductConstraints,
): NewProductDraft {
  if (typeof input !== "object" || input === null) {
    throw new ProductStoreError("invalid_patch");
  }
  const body = input as Record<string, unknown>;

  const slug = requiredSlug(body.slug);
  if (constraints.seedSlugs?.has(slug)) throw new ProductStoreError("slug_taken");

  const partNumber = text(body.partNumber, PART_NUMBER_MAX, "invalid_part_number");
  if (!partNumber) throw new ProductStoreError("invalid_part_number");
  if (constraints.seedPartNumbers?.has(partNumber.toLowerCase())) {
    throw new ProductStoreError("part_number_taken");
  }

  const brand = text(body.brand, BRAND_MAX, "invalid_brand");
  if (!brand) throw new ProductStoreError("invalid_brand");

  const categorySlug = text(body.categorySlug, 80, "invalid_category");
  if (!categorySlug || !constraints.categorySlugs.has(categorySlug)) {
    throw new ProductStoreError("invalid_category");
  }

  const name = localisedText(body.name, NAME_MAX, "invalid_name") ?? {};
  const nameEn = name.en?.trim() ?? "";
  if (!nameEn) throw new ProductStoreError("invalid_name");
  const description = localisedText(body.description, DESCRIPTION_MAX, "invalid_description") ?? {};

  const image = imageValue(body.image);
  if (!image) throw new ProductStoreError("invalid_image");

  const price = priceValue(body.price ?? null);
  const specs = specRows(body.specs) ?? [];
  const technicalSpecs = specRows(body.technicalSpecs) ?? [];
  const oemNumbers = body.oemNumbers === undefined ? [] : oemNumberList(body.oemNumbers);

  // Optional list of extra brands: the form asks for one, the record stores the
  // list the catalogue searches and filters on.
  const extraBrands: string[] = [];
  if (Array.isArray(body.brands)) {
    if (body.brands.length > 20) throw new ProductStoreError("invalid_brand");
    for (const entry of body.brands) {
      const value = text(entry, BRAND_MAX, "invalid_brand");
      if (value) extraBrands.push(value);
    }
  }
  const brands = [...new Set([brand, ...extraBrands])];

  const draft: NewProductDraft = {
    slug,
    partNumber,
    brand,
    brands,
    categorySlug,
    name: { en: nameEn, zh: name.zh ?? nameEn },
    description: { en: description.en ?? "", zh: description.zh ?? description.en ?? "" },
    image,
    inStock: typeof body.inStock === "boolean" ? body.inStock : true,
    specs,
    // The card reads `specs`, the product page table reads `technicalSpecs`;
    // a form with only one table must fill both.
    technicalSpecs: technicalSpecs.length > 0 ? technicalSpecs : specs,
    compatibleMachines: text(body.compatibleMachines, COMPATIBLE_MAX, "invalid_compatible") ?? "",
    oemNumbers,
  };
  if (price) draft.price = price;
  return draft;
}
