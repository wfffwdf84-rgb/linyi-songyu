import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { editorOnly } from "@/lib/admin-guard";
import {
  AnnouncementError,
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from "@/lib/announcements";

/**
 * Announcement writes. Owners and editors only - the same guard the product
 * editor uses, because a banner is public site copy.
 *
 * Every successful write calls revalidatePath("/", "layout"): the bar is chosen
 * in the locale layout, which means every prerendered page carries a copy of
 * it, and only a layout-wide revalidation expires them all.
 */

/** Codes the client maps to Chinese copy; anything else becomes a 500. */
const STATUS: Record<string, number> = {
  invalid_announcement: 400,
  invalid_style: 400,
  invalid_text: 400,
  invalid_href: 400,
  invalid_schedule: 400,
  too_many_announcements: 409,
  not_found: 404,
  not_configured: 503,
  unavailable: 503,
};

function failure(error: unknown) {
  if (error instanceof AnnouncementError) {
    return NextResponse.json(
      { ok: false, error: error.code },
      { status: STATUS[error.code] ?? 400 },
    );
  }
  console.error("admin announcements request failed", error);
  return NextResponse.json({ ok: false, error: "unavailable" }, { status: 500 });
}

function noStore<T>(body: T) {
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const body = await request.json().catch(() => null);

  try {
    const announcement = await createAnnouncement(body);
    revalidatePath("/", "layout");
    return noStore({ ok: true, announcement });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  try {
    // `patch` is optional on purpose: the list's enable/disable button sends
    // only { active } and the store merges it with the stored record.
    const announcement = await updateAnnouncement(id, body?.patch ?? {});
    revalidatePath("/", "layout");
    return noStore({ ok: true, announcement });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const id = (new URL(request.url).searchParams.get("id") ?? "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  try {
    await deleteAnnouncement(id);
    revalidatePath("/", "layout");
    return noStore({ ok: true, deleted: true });
  } catch (error) {
    return failure(error);
  }
}
