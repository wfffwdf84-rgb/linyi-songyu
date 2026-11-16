import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  effectiveHeroSettings,
  effectiveSiteImages,
  findSiteImageSlot,
  normalizeSiteImageSettingsPatch,
  normalizeSiteImageValue,
  parseSiteImageDocument,
  planSiteImageSettingsWrite,
  planSiteImageWrite,
  SiteImageError,
  siteImageListFrom,
  siteImageFrom,
  type HeroSettings,
  type SiteImageSettings,
  type SiteImageDocument,
  type SiteImageMap,
  type SiteImageOverrides,
} from "@/lib/site-image-slots";
import { readDocument, storageConfigured, writeDocument } from "@/lib/supabase";

/**
 * Storage for the replaceable site images and the settings that sit beside them.
 *
 * One plain-text row of `songyu_documents`, shaped like the copy overlay: sparse,
 * `slotId -> public URL(s)`, absent means "the file that shipped", plus an
 * optional `settings` object for the hero carousel. Reading is fail-open - an
 * unconfigured store, a network failure or a corrupt body all mean "use the
 * shipped images and the default settings" - because a decoration must never be
 * able to 500 a page. Writing is fail-closed: a document that could not be read
 * is never replaced with an empty one, which would silently revert every image.
 *
 * Both writers read the whole document before mutating it, so saving an image
 * keeps the settings and saving a setting keeps the images. Every write produces
 * a version-2 document; a version-1 document is still read, with its missing
 * settings resolved to the defaults.
 *
 * The read is cached twice on purpose: `unstable_cache` with a tag so the admin
 * save can expire it, and `cache()` so one request that renders the header, the
 * footer and a page body reads the row once.
 */

/** Fixed key: the only document, read as one row and overwritten in place. */
export const SITE_IMAGES_PATH = "content/site-images.json";

/** Tag on the cached read, expired by every successful save. */
export const SITE_IMAGES_TAG = "site-images";

/** Why the last read produced its values; the panel shows it, visitors never do. */
export type SiteImageReadStatus = "" | "not_configured" | "unreadable";

export * from "@/lib/site-image-slots";

type SiteImagesSnapshot = {
  overrides: SiteImageOverrides;
  settings: SiteImageSettings;
  status: SiteImageReadStatus;
};

const loadSiteImagesCached = unstable_cache(
  async (): Promise<SiteImagesSnapshot> => {
    if (!storageConfigured()) return { overrides: {}, settings: {}, status: "not_configured" };
    try {
      const body = await readDocument(SITE_IMAGES_PATH);
      if (body === null) return { overrides: {}, settings: {}, status: "" };
      const parsed = parseSiteImageDocument(body);
      return { overrides: parsed.images, settings: parsed.settings, status: "" };
    } catch (error) {
      console.error("site images could not be read; serving the shipped files", error);
      return { overrides: {}, settings: {}, status: "unreadable" };
    }
  },
  // Key bumped for version 2: the cached value now also carries `settings`, and an
  // entry written by the previous shape must not be read as if it had none.
  ["site-images-v2"],
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

/**
 * The hero carousel settings with the defaults filled in. Fail-open: a version-1
 * document, an unconfigured store or an unreadable row all mean 3 seconds with
 * autoplay on, which is what the carousel shipped with.
 */
export async function readSiteImageSettings(): Promise<HeroSettings> {
  return effectiveHeroSettings((await readSiteImagesCached()).settings);
}

/** The same read with the outcome kept, for the panel and for diagnostics. */
export async function readSiteImagesReport(): Promise<{
  images: SiteImageMap;
  overrides: SiteImageOverrides;
  settings: HeroSettings;
  status: SiteImageReadStatus;
}> {
  const { overrides, settings, status } = await readSiteImagesCached();
  return {
    images: effectiveSiteImages(overrides),
    overrides,
    settings: effectiveHeroSettings(settings),
    status,
  };
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
async function readForWrite(): Promise<{ images: SiteImageOverrides; settings: SiteImageSettings }> {
  if (!storageConfigured()) throw new SiteImageError("not_configured");
  try {
    const body = await readDocument(SITE_IMAGES_PATH);
    return body === null ? { images: {}, settings: {} } : parseSiteImageDocument(body);
  } catch (error) {
    console.error("site images could not be read before writing", error);
    throw new SiteImageError("unavailable");
  }
}

/**
 * The document body to store. Always version 2; `settings` is omitted when it
 * holds nothing, so a site that never touched the carousel keeps a version-2
 * document with exactly the shape a version-1 one had.
 */
function documentBody(images: SiteImageOverrides, settings: SiteImageSettings): string {
  const document: SiteImageDocument = {
    version: 2,
    updatedAt: new Date().toISOString(),
    images,
    ...(Object.keys(settings).length > 0 ? { settings } : {}),
  };
  return `${JSON.stringify(document, null, 2)}\n`;
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
 * storage is read; a value equal to the shipped files deletes the entry. The
 * stored settings are carried over untouched.
 */
export async function saveSiteImage(slotId: unknown, value: unknown): Promise<SiteImageSaveResult> {
  const slot = findSiteImageSlot(slotId);
  if (!slot) throw new SiteImageError("invalid_slot", String(slotId ?? ""));
  // Validate the value before touching storage: a malformed request costs no read.
  normalizeSiteImageValue(slot, value);

  const current = await readForWrite();
  const next = planSiteImageWrite(current.images, slot.id, value);
  const restored = !Object.prototype.hasOwnProperty.call(next, slot.id);

  const result: SiteImageSaveResult = {
    slotId: slot.id,
    value: effectiveSiteImages(next)[slot.id],
    restored,
    written: false,
  };
  if (JSON.stringify(current.images) === JSON.stringify(next)) return result;

  try {
    await writeDocument(SITE_IMAGES_PATH, documentBody(next, current.settings));
  } catch (error) {
    console.error("site images could not be written", error);
    throw new SiteImageError("unavailable");
  }
  return { ...result, written: true };
}

export type SiteSettingsSaveResult = {
  /** The settings now in effect, defaults included. */
  settings: HeroSettings;
  /** True when the document was written; false when the request changed nothing. */
  written: boolean;
};

/**
 * Validates and stores the hero carousel settings. A request carrying an interval
 * outside 2000-15000 ms, a fractional interval or a non-boolean autoplay is
 * refused with `invalid_interval` / `invalid_autoplay` before storage is read.
 * The stored images are carried over untouched.
 *
 * A patch that resolves to the defaults deletes the stored fields, so "回到默认"
 * never leaves a redundant `settings` object behind.
 */
export async function saveSiteImageSettings(patch: unknown): Promise<SiteSettingsSaveResult> {
  // Validate before the read: a malformed request costs no storage round trip.
  const normalized = normalizeSiteImageSettingsPatch(patch);

  const current = await readForWrite();
  const nextSettings = planSiteImageSettingsWrite(current.settings, normalized);
  const now = effectiveHeroSettings(nextSettings);
  const before = effectiveHeroSettings(current.settings);

  const unchanged =
    now.heroIntervalMs === before.heroIntervalMs && now.heroAutoplay === before.heroAutoplay;
  if (unchanged) return { settings: now, written: false };

  try {
    await writeDocument(SITE_IMAGES_PATH, documentBody(current.images, nextSettings));
  } catch (error) {
    console.error("site image settings could not be written", error);
    throw new SiteImageError("unavailable");
  }
  return { settings: now, written: true };
}
