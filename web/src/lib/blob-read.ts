/**
 * Reads a canonical Blob document from its fixed pathname.
 *
 * The store is public, so every document sits at a stable, derivable URL. That
 * is what lets the product overlay and the admin account list be read with one
 * plain GET instead of a list() call: list() counts as an Advanced Operation and
 * the store's free quota was suspended by exactly that traffic.
 *
 * The catch is caching: a public Blob is CDN-cached for at least 60 seconds, so
 * a document read back from a stable URL right after a write is the previous
 * version. Every read therefore carries a fresh, monotonically increasing `?v=`
 * query string, which forces a cache miss and returns the current object. The
 * request is still a single GET - bandwidth only, never an Advanced Operation.
 */

const READ_TIMEOUT_MS = 5_000;

/**
 * The public origin of this store. `BLOB_READ_WRITE_TOKEN` has the shape
 * `vercel_blob_rw_<storeId>_<secret>`, and a public store is served from
 * `<storeId>.public.blob.vercel-storage.com`.
 *
 * `BLOB_PUBLIC_BASE_URL` overrides the derived origin; it exists so a local fake
 * Blob server can exercise the read path without touching a real store.
 */
export function blobPublicBaseUrl(): string {
  const override = process.env.BLOB_PUBLIC_BASE_URL?.trim();
  if (override) return override.replace(/\/+$/, "");

  const storeId =
    process.env.BLOB_STORE_ID?.trim() ||
    process.env.BLOB_READ_WRITE_TOKEN?.trim().split("_")[3] ||
    "";
  if (!storeId) throw new Error("blob store id is unknown");
  return `https://${storeId}.public.blob.vercel-storage.com`;
}

/** Per-process counter: two reads in the same millisecond still differ. */
let readSequence = 0;

/** Fixed pathname plus a fresh cache-busting version, never one URL twice. */
export function blobDocumentUrl(pathname: string): string {
  readSequence = (readSequence + 1) % 1_000_000;
  const version = `${Date.now().toString(36)}-${readSequence.toString(36)}`;
  return `${blobPublicBaseUrl()}/${pathname}?v=${version}`;
}

/**
 * Returns null only when the document has never been written (404). Every other
 * failure throws: callers decide whether to fail open, and a suspended or
 * unreadable store must not be mistaken for an empty document.
 */
export async function readBlobDocument(
  pathname: string,
  timeoutMs: number = READ_TIMEOUT_MS,
): Promise<Response | null> {
  const response = await fetch(blobDocumentUrl(pathname), {
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`blob document ${pathname} could not be read (${response.status})`);
  }
  return response;
}
