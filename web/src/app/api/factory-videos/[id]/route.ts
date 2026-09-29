import { NextResponse } from "next/server";
import { isFactoryUploadAuthed, sanitizeFactoryVideoTitle } from "@/lib/factory-video-auth";
import { listFactoryVideos, removeFactoryVideo, renameFactoryVideo } from "@/lib/factory-video-store";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Props) {
  if (!isFactoryUploadAuthed(request.headers.get("cookie"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { title?: string } | null;
  const title = sanitizeFactoryVideoTitle(body?.title ?? "", "");
  if (!id || !title) return NextResponse.json({ error: "missing" }, { status: 400 });
  const videos = await renameFactoryVideo(id, title);
  return NextResponse.json({ videos });
}

export async function DELETE(request: Request, { params }: Props) {
  if (!isFactoryUploadAuthed(request.headers.get("cookie"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "missing" }, { status: 400 });
  const videos = await removeFactoryVideo(id);
  return NextResponse.json({ videos: videos ?? (await listFactoryVideos()) });
}
