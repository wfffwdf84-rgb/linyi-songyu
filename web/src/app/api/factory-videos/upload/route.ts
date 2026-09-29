import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isFactoryUploadAuthed, sanitizeFactoryVideoTitle } from "@/lib/factory-video-auth";
import { addFactoryVideo, listFactoryVideos } from "@/lib/factory-video-store";
import { FACTORY_VIDEO_MAX_BYTES, FACTORY_VIDEO_MAX_COUNT, isPlayableFactoryVideoName } from "@/lib/factory-videos";

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "storage_not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
  if (!body?.type) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (body.type !== "blob.upload-completed" && !isFactoryUploadAuthed(request.headers.get("cookie"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!isPlayableFactoryVideoName(pathname)) {
          throw new Error("mp4_only");
        }
        const current = await listFactoryVideos();
        if (current.length >= FACTORY_VIDEO_MAX_COUNT) {
          throw new Error("limit");
        }
        return {
          allowedContentTypes: ["video/mp4", "video/webm", "video/x-m4v", "application/octet-stream"],
          addRandomSuffix: true,
          maximumSizeInBytes: FACTORY_VIDEO_MAX_BYTES,
          allowOverwrite: false,
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        let title = "厂区视频";
        try {
          const parsed = JSON.parse(tokenPayload || "") as { title?: string };
          title = sanitizeFactoryVideoTitle(parsed.title ?? "");
        } catch {
          // keep default title
        }
        await addFactoryVideo({
          id: randomUUID(),
          url: blob.url,
          title,
          createdAt: new Date().toISOString(),
        });
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    const message = error instanceof Error ? error.message : "upload_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
