import { NextResponse } from "next/server";
import { getAdminSession, requireRole } from "@/lib/admin-auth";
import { listInquiries, removeInquiry } from "@/lib/inquiry-store";

type Props = {
  params: Promise<{ id: string }>;
};

/** Deleting a lead is destructive, so sales is refused even with a crafted request. */
export async function DELETE(_request: Request, { params }: Props) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!requireRole(session, ["owner", "editor"])) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  try {
    // The record is needed for its document key, which embeds receivedAt: the
    // API exposes no delete-by-id, so resolve it from the decrypted list.
    const record = (await listInquiries()).find((inquiry) => inquiry.id === id);
    if (!record) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    await removeInquiry(record.receivedAt, record.id);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("inquiry delete failed", error);
    return NextResponse.json({ ok: false, error: "delete" }, { status: 500 });
  }
}
