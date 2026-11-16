import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  effectiveSiteImages,
  findSiteImageSlot,
  normalizeSiteImageValue,
  parseSiteImageDocument,
  planSiteImageWrite,
  SiteImageError,
  siteImageListFrom,
  siteImageFrom,
  type SiteImageMap,
  type SiteImageOverrides,
} from "@/lib/site-image-slots";
import { readDocument, storageConfigured, writeDocument } from "@/lib/supabase";

/**
 * Storage for the replaceable site images.
 *
 * One plain-text row of `songyu_documents`, shaped like the copy overlay: sparse,
 * `slotId -> public URL(s)`, absent means "the file that shipped". Reading is
 * fail-open - an unconfigured store, a network failure or a corrupt body all mean
 * "use the shipped images" - because a decoration must never be able to 500 a
 * page. Writing is fail-closed: a document that could not be read is never
 * replaced with an empty one, which would silently revert every image.
 *
 * The read is cached twice on purpose: `unstable_cache` with a tag so the admin
 * save can expire it, and `cache()` so one request that renders the header, the
 * footer and a page body reads the row once.
 */

/** Fixed key: the only document, read as one row and overwritten in place. */
export const SITE_IMAGES_PATH = "content/site-images.json";

/** Tag on the cached read, expired by every successful save. */
export const SITE_IMAGES_TAG = "site-images";

/** Why the last read produced its map; the panel shows it, visitors never do. */
export type SiteImageReadStatus = "" | "not_configured" | "unreadable";

export * from "@/lib/site-image-slots";

const loadSiteImagesCached = unstable_cache(
  async (): Promise<{ overrides: SiteImageOverrides; status: SiteImageReadStatus }> => {
    if (!storageConfigured()) return { overrides: {}, status: "not_configured" };
    try {
      const body = await readDocument(SITE_IMAGES_PATH);
      if (body === null) return { overrides: {}, status: "" };
      return { overrides: parseSiteImageDocument(body), status: "" };
    } catch (error) {
      console.error("site images could not be read; serving the shipped files", error);
      return { overrides: {}, status: "unreadable" };
    }
  },
  ["site-images-v1"],
  { tags: [SITE_IMAGES_TAG], revalidate: false },
);

const readSiteImagesCached = cache(loadSiteImagesCached);

/** The stored overrides only; the panel needs them to mark "已替换". */
export async function readSiteImageOverrides(): Promise<SiteImageOverrides> {
  return (await readSiteImagesCached()).overrides;
}

/**
 * Every slot's effective value, defaults filled in - what the components render.
 * Fail-open: on any storage problem this is exactly the shipped images.
 */
export async function readSiteImages(): Promise<SiteImageMap> {
  return effectiveSiteImages((await readSiteImagesCached()).overrides);
}

/** The same read with the outcome kept, for the panel and for diagnostics. */
export async function readSiteImagesReport(): Promise<{
  images: SiteImageMap;
  overrides: SiteImageOverrides;
  status: SiteImageReadStatus;
}> {
  const { overrides, status } = await readSiteImagesCached();
  return { images: effectiveSiteImages(overrides), overrides, status };
}

/** One slot's first effective image, for a component that renders a single photo. */
export async function siteImage(slotId: string): Promise<string> {
  return siteImageFrom(await readSiteImages(), slotId);
}

/** One slot's effective list, for a carousel or a gallery. */
export async function siteImageList(slotId: string): Promise<string[]> {
  return siteImageListFrom(await readSiteImages(), slotId);
}

/* --------------------------------------------------------------- transport */

/** Reads the current document before any mutation; throws instead of writing. */
async function readForWrite(): Promise<SiteImageOverrides> {
  if (!storageConfigured()) throw new SiteImageError("not_configured");
  try {
    const body = await readDocument(SITE_IMAGES_PATH);
    return body === null ? {} : parseSiteImageDocument(body);
  } catch (error) {
    console.error("site images could not be read before writing", error);
    throw new SiteImageError("unavailable");
  }
}

export type SiteImageSaveResult = {
  slotId: string;
  /** The value now in effect for that slot. */
  value: string | string[];
  /** True when the slot is back on its shipped file. */
  restored: boolean;
  /** True when the document was written; false when nothing had changed. */
  written: boolean;
};

/**
 * Validates and stores one slot. A request naming an unknown slot, a value of the
 * wrong shape or an empty carousel is answered with a `SiteImageError` before
 * storage is read; a value equal to the shipped files deletes the entry.
 */
export async function saveSiteImage(slotId: unknown, value: unknown): Promise<SiteImageSaveResult> {
  const slot = findSiteImageSlot(slotId);
  if (!slot) throw new SiteImageError("invalid_slot", String(slotId ?? ""));
  // Validate the value before touching storage: a malformed request costs no read.
  normalizeSiteImageValue(slot, value);

  const current = await readForWrite();
  const next = planSiteImageWrite(current, slot.id, value);
  const restored = !Object.prototype.hasOwnProperty.call(next, slot.id);

  const result: SiteImageSaveResult = {
    slotId: slot.id,
    value: effectiveSiteImages(next)[slot.id],
    restored,
    written: false,
  };
  if (JSON.stringify(current) === JSON.stringify(next)) return result;

  const document = {
    version: 1 as const,
    updatedAt: new Date().toISOString(),
    images: next,
  };
  try {
    await writeDocument(SITE_IMAGES_PATH, `${JSON.stringify(document, null, 2)}\n`);
  } catch (error) {
    console.error("site images could not be written", error);
    throw new SiteImageError("unavailable");
  }
  return { ...result, written: true };
}
