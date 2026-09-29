import { NextResponse } from "next/server";
import { isFactoryUploadAuthed } from "@/lib/factory-video-auth";
import { repairFactoryVideos } from "@/lib/factory-video-store";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isFactoryUploadAuthed(request.headers.get("cookie"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await repairFactoryVideos();
  return NextResponse.json(result);
}
