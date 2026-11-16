import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { editorOnly } from "@/lib/admin-guard";
import {
  SITE_IMAGES_TAG,
  saveSiteImage,
  saveSiteImageSettings,
  SiteImageError,
  SITE_IMAGE_ERROR_STATUS,
} from "@/lib/site-images";

/**
 * The site-image overlay: one slot per request, or the carousel settings.
 *
 * Two body shapes share this route because they share one document and one
 * revalidation:
 *
 * - `{ slotId, value }` - `value` is a string for a single-image slot and a string
 *   array for a carousel. An empty string, an empty array or a value equal to the
 *   shipped file means "恢复默认" and deletes the entry, which is why restoring
 *   never needs its own route.
 * - `{ settings: { heroIntervalMs?, heroAutoplay? } }` - the site-wide hero
 *   carousel cadence and autoplay switch. `heroIntervalMs` must be a whole number
 *   of milliseconds between 2000 and 15000 (`invalid_interval`), `heroAutoplay` a
 *   boolean (`invalid_autoplay`). Either field may be omitted; the other keeps its
 *   stored value. Saving the defaults deletes the stored field.
 *
 * Owners and editors only - the same guard the product editor and the copy
 * editor use. The slot whitelist, the URL rules and the interval range are
 * enforced inside the storage layer, so a hand-rolled request cannot write an
 * unknown slot, a `javascript:` URL or a 500 ms carousel, and the panel hiding
 * those options is only a convenience.
 *
 * Every successful write expires the cached slot map and revalidates the whole
 * layout: the header, the footer and every page render these images, and the home
 * page renders the interval, so only a layout-wide revalidation reaches all of
 * them.
 */

export const dynamic = "force-dynamic";

function failure(error: unknown) {
  if (error instanceof SiteImageError) {
    return NextResponse.json(
      { ok: false, error: error.code, detail: error.detail },
      { status: SITE_IMAGE_ERROR_STATUS[error.code] ?? 400 },
    );
  }
  console.error("admin site images request failed", error);
  return NextResponse.json({ ok: false, error: "unavailable" }, { status: 500 });
}

function saved(payload: object) {
  revalidateTag(SITE_IMAGES_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, ...payload }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const { slotId, value, settings } = body as Record<string, unknown>;

  try {
    // `settings` is checked first and by key, so a slot whose id were ever
    // literally "settings" could not collide with this branch.
    if (Object.prototype.hasOwnProperty.call(body, "settings")) {
      const result = await saveSiteImageSettings(settings);
      if (!result.written) {
        return NextResponse.json(
          { ok: true, ...result },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
      return saved(result);
    }

    const result = await saveSiteImage(slotId, value);
    if (!result.written) {
      return NextResponse.json(
        { ok: true, ...result },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    return saved(result);
  } catch (error) {
    return failure(error);
  }
}
