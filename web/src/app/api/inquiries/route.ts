import { NextResponse } from "next/server";
import { isInquiryDeskAuthed } from "@/lib/inquiry-auth";
import { inquiryStorageConfigured, listInquiries } from "@/lib/inquiry-store";

export async function GET(request: Request) {
  if (!isInquiryDeskAuthed(request.headers.get("cookie"))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!inquiryStorageConfigured()) {
    return NextResponse.json({ ok: false, error: "unconfigured" }, { status: 503 });
  }
  try {
    return NextResponse.json({ ok: true, inquiries: await listInquiries() });
  } catch (error) {
    console.error("inquiry list failed", error);
    return NextResponse.json({ ok: false, error: "list" }, { status: 500 });
  }
}
