import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { editorOnly } from "@/lib/admin-guard";
import {
  SITE_IMAGES_TAG,
  saveSiteImage,
  SiteImageError,
  SITE_IMAGE_ERROR_STATUS,
} from "@/lib/site-images";

/**
 * The site-image overlay: one slot per request.
 *
 * Body: `{ slotId, value }`, where `value` is a string for a single-image slot
 * and a string array for a carousel. An empty string, an empty array or a value
 * equal to the shipped file means "恢复默认" and deletes the entry, which is why
 * restoring never needs its own route.
 *
 * Owners and editors only - the same guard the product editor and the copy
 * editor use. The slot whitelist and the URL rules are enforced inside
 * `saveSiteImage`, so a hand-rolled request cannot write an unknown slot or a
 * `javascript:` URL, and the panel hiding those options is only a convenience.
 *
 * Every successful write expires the cached slot map and revalidates the whole
 * layout: the header, the footer and every page render these images, so only a
 * layout-wide revalidation reaches all of them.
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

export async function PATCH(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const { slotId, value } = body as Record<string, unknown>;

  try {
    const result = await saveSiteImage(slotId, value);
    if (result.written) {
      revalidateTag(SITE_IMAGES_TAG, { expire: 0 });
      revalidatePath("/", "layout");
    }
    return NextResponse.json(
      { ok: true, ...result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
