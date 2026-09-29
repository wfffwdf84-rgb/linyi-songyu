import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isFactoryUploadAuthed, sanitizeFactoryVideoTitle } from "@/lib/factory-video-auth";
import {
  addFactoryVideo,
  listFactoryVideos,
  localVideoDiskPath,
  localVideoPublicPath,
} from "@/lib/factory-video-store";
import {
  FACTORY_VIDEO_MAX_BYTES,
  FACTORY_VIDEO_MAX_COUNT,
  FACTORY_VIDEO_TYPES,
  type FactoryVideo,
} from "@/lib/factory-videos";

function extFromFile(file: File) {
  const fromName = path.extname(file.name).toLowerCase();
  if (fromName === ".mp4" || fromName === ".webm" || fromName === ".mov" || fromName === ".m4v") {
    return fromName;
  }
  if (file.type === "video/webm") return ".webm";
  if (file.type === "video/quicktime") return ".mov";
  return ".mp4";
}

export async function POST(request: Request) {
  if (process.env.VERCEL === "1") {
    return NextResponse.json({ error: "use_blob" }, { status: 403 });
  }
  if (!isFactoryUploadAuthed(request.headers.get("cookie"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const current = await listFactoryVideos();
  if (current.length >= FACTORY_VIDEO_MAX_COUNT) {
    return NextResponse.json({ error: "limit" }, { status: 400 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }
  if (file.size > FACTORY_VIDEO_MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 400 });
  }
  if (file.type && !FACTORY_VIDEO_TYPES.includes(file.type as (typeof FACTORY_VIDEO_TYPES)[number])) {
    return NextResponse.json({ error: "type" }, { status: 400 });
  }
  const id = randomUUID();
  const ext = extFromFile(file);
  const disk = localVideoDiskPath(id, ext);
  await mkdir(path.dirname(disk), { recursive: true });
  await writeFile(disk, Buffer.from(await file.arrayBuffer()));
  const title = sanitizeFactoryVideoTitle(String(form.get("title") ?? ""), file.name.replace(/\.[^.]+$/, ""));
  const video: FactoryVideo = {
    id,
    url: localVideoPublicPath(id, ext),
    title,
    createdAt: new Date().toISOString(),
  };
  await addFactoryVideo(video);
  return NextResponse.json({ video, videos: await listFactoryVideos() });
}
