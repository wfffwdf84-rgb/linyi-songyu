import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isFactoryUploadAuthed, isAllowedFactoryVideoUrl, sanitizeFactoryVideoTitle } from "@/lib/factory-video-auth";
import { addFactoryVideo, listFactoryVideos } from "@/lib/factory-video-store";
import { FACTORY_VIDEO_MAX_COUNT, factoryVideoBlobKey, type FactoryVideo } from "@/lib/factory-videos";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isFactoryUploadAuthed(request.headers.get("cookie"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    url?: string;
    title?: string;
  } | null;
  const url = body?.url?.trim() ?? "";
  if (!isAllowedFactoryVideoUrl(url)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }
  const current = await listFactoryVideos();
  const already = current.some((item) => factoryVideoBlobKey(item.url) === factoryVideoBlobKey(url));
  if (!already && current.length >= FACTORY_VIDEO_MAX_COUNT) {
    return NextResponse.json({ error: "limit" }, { status: 400 });
  }
  const title = sanitizeFactoryVideoTitle(body?.title ?? "");
  const video: FactoryVideo = {
    id: randomUUID(),
    url,
    title,
    createdAt: new Date().toISOString(),
  };
  const videos = await addFactoryVideo(video);
  return NextResponse.json({ video, videos });
}
