import { NextResponse } from "next/server";
import { factoryAuthClearCookie } from "@/lib/factory-video-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", factoryAuthClearCookie());
  return response;
}
