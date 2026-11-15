import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Transport layer for the storage that used to be a Vercel Blob store.
 *
 * Everything the site persists falls into one of two shapes, and each shape has
 * exactly one home now:
 *
 * - a JSON document, encrypted or not, addressed by the pathname it used to
 *   have in Blob (`admin/users.json`, `content/products.json`, `inquiries/<id>.json`
 *   ...) and stored as a text row in `songyu_documents`;
 * - a media file (product photo, factory video), stored as an object in the
 *   public `songyu-media` bucket and addressed by its public URL.
 *
 * Keeping the old pathnames as document keys means no store had to learn a new
 * naming scheme, and the encryption layer above this one is untouched.
 *
 * Both the table and the bucket are reached with the `service_role` key, which
 * bypasses row level security. The key must stay server side: no `NEXT_PUBLIC_`
 * prefix, and nothing here may be imported by a client component.
 */

/** Documents table. The migration that creates it lives in `supabase/schema.sql`. */
export const DOCUMENTS_TABLE = "songyu_documents";

/** Public bucket for product photos and factory videos. */
export const MEDIA_BUCKET = "songyu-media";

/** Media is immutable (the pathname carries a random suffix), so cache it hard. */
const MEDIA_CACHE_CONTROL_SEC = "31536000";

/** Keys per `in (...)`: PostgREST URLs are long, so batch instead of one big call. */
const KEY_BATCH = 100;

/**
 * Raised by every helper here.
 *
 * - `not_configured`: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are missing. The
 *   caller reports "storage unavailable" without pretending the store is empty.
 * - `unavailable`: the request was made and failed (network, 4xx, 5xx, timeout).
 */
export class StorageError extends Error {
  constructor(
    readonly code: "not_configured" | "unavailable",
    message: string,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

type DocumentRow = { key: string; body: string };

function projectUrl() {
  return (process.env.SUPABASE_URL?.trim() ?? "").replace(/\/+$/, "");
}

function serviceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
}

/** True when both Supabase variables are present. Says nothing about reachability. */
export function storageConfigured() {
  return Boolean(projectUrl() && serviceRoleKey());
}

let cached: SupabaseClient | null = null;
let cachedFor = "";

/**
 * The one server client. `persistSession` is off because this process holds no
 * user session: the key is the service role, and refreshing or storing a token
 * here would be meaningless.
 */
function client(): SupabaseClient {
  const url = projectUrl();
  const key = serviceRoleKey();
  if (!url || !key) throw new StorageError("not_configured", "supabase is not configured");
  if (cached && cachedFor === `${url}:${key}`) return cached;
  cached = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  cachedFor = `${url}:${key}`;
  return cached;
}

/** One error shape for callers that only decide between "retry later" and "fail". */
function wrap(error: unknown, what: string): StorageError {
  if (error instanceof StorageError) return error;
  const detail = error instanceof Error ? error.message : String(error);
  return new StorageError("unavailable", `${what}: ${detail}`);
}

/**
 * A Supabase request that failed means the store is not answering, which is what
 * the inquiry form turns into the WhatsApp hand-off and the catalogue turns into
 * the seed data. Network failures arrive as `TypeError`, so they count too.
 */
export function storageUnavailable(error: unknown): boolean {
  if (error instanceof StorageError) return true;
  if (error instanceof TypeError) return true;
  if (error instanceof DOMException && error.name === "TimeoutError") return true;
  return false;
}

/* -------------------------------------------------------------- documents */

/** The document body, or null when the key has never been written. */
export async function readDocument(key: string): Promise<string | null> {
  if (!storageConfigured()) throw new StorageError("not_configured", "supabase is not configured");
  try {
    const { data, error } = await client()
      .from(DOCUMENTS_TABLE)
      .select("body")
      .eq("key", key)
      .maybeSingle();
    if (error) throw wrap(error, `document ${key} could not be read`);
    const row = data as { body?: unknown } | null;
    return typeof row?.body === "string" ? row.body : null;
  } catch (error) {
    throw wrap(error, `document ${key} could not be read`);
  }
}

/**
 * Inserts or replaces one document. The write is an upsert on the primary key, so
 * the first save of a key and the hundredth take the same path.
 */
export async function writeDocument(key: string, body: string): Promise<void> {
  if (!storageConfigured()) throw new StorageError("not_configured", "supabase is not configured");
  try {
    const { error } = await client()
      .from(DOCUMENTS_TABLE)
      .upsert({ key, body, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw wrap(error, `document ${key} could not be written`);
  } catch (error) {
    throw wrap(error, `document ${key} could not be written`);
  }
}

export async function deleteDocument(key: string): Promise<void> {
  if (!storageConfigured()) throw new StorageError("not_configured", "supabase is not configured");
  try {
    const { error } = await client().from(DOCUMENTS_TABLE).delete().eq("key", key);
    if (error) throw wrap(error, `document ${key} could not be deleted`);
  } catch (error) {
    throw wrap(error, `document ${key} could not be deleted`);
  }
}

/**
 * Every key under a prefix. Inquiries use this instead of fetching each row: one
 * query returns the ids, and the bodies follow in batches of KEY_BATCH.
 */
export async function listDocumentKeys(prefix: string): Promise<string[]> {
  if (!storageConfigured()) throw new StorageError("not_configured", "supabase is not configured");
  try {
    // `%` and `_` are LIKE wildcards; no current key contains one, but escaping
    // keeps a future key with an underscore from matching more than it should.
    const pattern = `${prefix.replace(/[%_\\]/g, (char) => `\\${char}`)}%`;
    const { data, error } = await client()
      .from(DOCUMENTS_TABLE)
      .select("key")
      .like("key", pattern);
    if (error) throw wrap(error, `documents under ${prefix} could not be listed`);
    return ((data ?? []) as { key: string }[])
      .map((row) => row.key)
      .filter((key) => typeof key === "string")
      .sort();
  } catch (error) {
    throw wrap(error, `documents under ${prefix} could not be listed`);
  }
}

/** Bodies for a known set of keys, batched so a big inbox stays one round trip per 100. */
export async function readDocuments(keys: readonly string[]): Promise<Map<string, string>> {
  if (!storageConfigured()) throw new StorageError("not_configured", "supabase is not configured");
  const bodies = new Map<string, string>();
  for (let start = 0; start < keys.length; start += KEY_BATCH) {
    const batch = keys.slice(start, start + KEY_BATCH);
    try {
      const { data, error } = await client()
        .from(DOCUMENTS_TABLE)
        .select("key, body")
        .in("key", batch);
      if (error) throw wrap(error, "documents could not be read");
      for (const row of (data ?? []) as DocumentRow[]) {
        if (typeof row?.key === "string" && typeof row.body === "string") {
          bodies.set(row.key, row.body);
        }
      }
    } catch (error) {
      throw wrap(error, "documents could not be read");
    }
  }
  return bodies;
}

/** Cheapest query that proves the database answers; the health route wakes it. */
export async function pingDocuments(): Promise<boolean> {
  if (!storageConfigured()) return false;
  try {
    const { error } = await client().from(DOCUMENTS_TABLE).select("key").limit(1);
    return !error;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ media */

/**
 * The public URL of one object. This is a pure string build: it never calls
 * Supabase, so it also works while rendering a page from cache.
 */
export function mediaPublicUrl(path: string): string {
  return client().storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Prefix shared by every public URL of the bucket, e.g.
 * `https://<ref>.supabase.co/storage/v1/object/public/songyu-media/`.
 * Empty while Supabase is not configured.
 */
function mediaPublicPrefix(): string {
  if (!storageConfigured()) return "";
  return mediaPublicUrl("").replace(/\/+$/, "/");
}

/** The bucket-relative path when `url` points at this project's public bucket. */
export function mediaPathFromUrl(url: string): string | null {
  const prefix = mediaPublicPrefix();
  if (!prefix || !url.startsWith(prefix)) return null;
  const path = decodeURIComponent(url.slice(prefix.length).split(/[?#]/)[0]);
  return path || null;
}

/** True when the URL is served from this project, the only host we hand out. */
export function isMediaUrl(url: string): boolean {
  return mediaPathFromUrl(url) !== null;
}

/**
 * True when `host` is this Supabase project (or any `*.supabase.co` project, so
 * a value pasted from the dashboard before SUPABASE_URL existed still works).
 * Used by the URL allowlists that guard stored product and video links.
 */
export function isSupabaseMediaHost(host: string): boolean {
  const normalized = host.toLowerCase();
  const projectHost = (() => {
    try {
      return new URL(projectUrl()).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();
  if (projectHost && normalized === projectHost) return true;
  return normalized.endsWith(".supabase.co") || normalized.endsWith(".supabase.in");
}

/**
 * Uploads one immutable object and returns its public URL. `upsert` stays off:
 * every pathname carries a random suffix, so an overwrite would be a bug.
 */
export async function uploadMedia(
  path: string,
  body: Uint8Array | ArrayBuffer | Blob | string,
  contentType: string,
): Promise<{ path: string; url: string }> {
  if (!storageConfigured()) throw new StorageError("not_configured", "supabase is not configured");
  try {
    const { error } = await client()
      .storage.from(MEDIA_BUCKET)
      .upload(path, body, {
        contentType,
        cacheControl: MEDIA_CACHE_CONTROL_SEC,
        upsert: false,
      });
    if (error) throw wrap(error, `media ${path} could not be uploaded`);
    return { path, url: mediaPublicUrl(path) };
  } catch (error) {
    throw wrap(error, `media ${path} could not be uploaded`);
  }
}

/** Deletes objects; a missing object is not an error worth failing a request over. */
export async function removeMedia(paths: readonly string[]): Promise<void> {
  if (!storageConfigured() || paths.length === 0) return;
  try {
    const { error } = await client().storage.from(MEDIA_BUCKET).remove([...paths]);
    if (error) throw wrap(error, "media could not be removed");
  } catch (error) {
    throw wrap(error, "media could not be removed");
  }
}

export type MediaObject = {
  /** Bucket-relative path, e.g. `factory-videos/<id>`. */
  path: string;
  name: string;
  createdAt: string;
  size: number;
  contentType: string;
};

/** Files directly under a prefix, newest first. Folders are skipped. */
export async function listMedia(prefix: string, limit = 200): Promise<MediaObject[]> {
  if (!storageConfigured()) throw new StorageError("not_configured", "supabase is not configured");
  try {
    const { data, error } = await client()
      .storage.from(MEDIA_BUCKET)
      .list(prefix, { limit, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw wrap(error, `media under ${prefix} could not be listed`);
    const objects: MediaObject[] = [];
    for (const entry of data ?? []) {
      // `id` is null for a pseudo-folder: the bucket stores no real folders.
      if (!entry?.name || !entry.id) continue;
      const metadata = (entry.metadata ?? {}) as { size?: unknown; mimetype?: unknown };
      objects.push({
        path: `${prefix.replace(/\/+$/, "")}/${entry.name}`,
        name: entry.name,
        createdAt: typeof entry.created_at === "string" ? entry.created_at : new Date(0).toISOString(),
        size: typeof metadata.size === "number" ? metadata.size : 0,
        contentType: typeof metadata.mimetype === "string" ? metadata.mimetype : "",
      });
    }
    return objects;
  } catch (error) {
    throw wrap(error, `media under ${prefix} could not be listed`);
  }
}

export type SignedUpload = {
  path: string;
  /** Full URL (token included) the browser may PUT the bytes to. */
  signedUrl: string;
  /** The same token, kept separate for clients that build their own request. */
  token: string;
  /** Public URL the object will have once the upload finishes. */
  url: string;
};

/**
 * A signed upload URL lets the browser send a large video straight to Supabase.
 * The function body limit on Vercel is far below a 200 MB clip, so routing the
 * bytes through a route handler is not an option. The URL is valid for two hours.
 */
export async function createSignedUpload(path: string): Promise<SignedUpload> {
  if (!storageConfigured()) throw new StorageError("not_configured", "supabase is not configured");
  try {
    const { data, error } = await client().storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
    if (error) throw wrap(error, `signed upload for ${path} could not be created`);
    if (!data?.signedUrl || !data.token) {
      throw new StorageError("unavailable", `signed upload for ${path} returned no token`);
    }
    return { path: data.path || path, signedUrl: data.signedUrl, token: data.token, url: mediaPublicUrl(path) };
  } catch (error) {
    throw wrap(error, `signed upload for ${path} could not be created`);
  }
}
