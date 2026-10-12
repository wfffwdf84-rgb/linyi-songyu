import { NextResponse } from "next/server";
import { isInquiryDeskAuthed } from "@/lib/inquiry-auth";
import { markInquiriesRead } from "@/lib/inquiry-store";

/** Records how far the operator has read, so new leads stand out next visit. */
export async function POST(request: Request) {
  if (!isInquiryDeskAuthed(request.headers.get("cookie"))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { upTo?: unknown } | null;
  const upTo = typeof body?.upTo === "string" ? body.upTo : "";
  const when = new Date(upTo);
  // A far-future watermark would hide later leads, so only accept a real,
  // recently received timestamp.
  if (!upTo || Number.isNaN(when.getTime()) || when.getTime() > Date.now() + 5 * 60 * 1000) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  try {
    await markInquiriesRead(when.toISOString());
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("inquiry read state failed", error);
    return NextResponse.json({ ok: false, error: "save" }, { status: 500 });
  }
}
