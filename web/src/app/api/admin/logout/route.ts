import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", clearSessionCookie());
  response.headers.set("Cache-Control", "no-store");
  return response;
}
