import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isFactoryUploadAuthed, sanitizeFactoryVideoTitle } from "@/lib/factory-video-auth";
import { addFactoryVideo, listFactoryVideos } from "@/lib/factory-video-store";
import {
  FACTORY_VIDEO_MAX_BYTES,
  FACTORY_VIDEO_MAX_COUNT,
  FACTORY_VIDEO_TYPES,
  isPlayableFactoryVideoName,
  type FactoryVideo,
} from "@/lib/factory-videos";
import {
  StorageError,
  createSignedUpload,
  listMedia,
  mediaPublicUrl,
  storageConfigured,
} from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Direct-to-Supabase uploads, in two hops.
 *
 * A 200 MB clip cannot pass through a route handler: the Vercel request body cap
 * is a few megabytes. So the browser asks for a signed upload URL here, PUTs the
 * bytes straight to the public bucket, then reports the finished path. The old
 * Blob upload worked the same way (its `handleUpload` issued a client token),
 * which is why the flow is unchanged while the endpoint behind it is not.
 *
 * Both hops require the factory password cookie: a signed URL is a bearer
 * credential and must never be handed to an anonymous caller.
 */

/** Loosely typed on purpose: every field is validated before it is used. */
type UploadBody = {
  type?: unknown;
  filename?: unknown;
  contentType?: unknown;
  path?: unknown;
  title?: unknown;
};

const VIDEO_PREFIX = "factory-videos/";

function extensionFrom(name: string, contentType: string) {
  const match = name.match(/\.(mp4|webm|m4v)$/i);
  if (match) return match[1].toLowerCase();
  if (contentType === "video/webm") return "webm";
  return "mp4";
}

function failure(error: unknown) {
  console.error("factory video upload failed", error);
  const notConfigured = error instanceof StorageError && error.code === "not_configured";
  return NextResponse.json(
    { error: notConfigured ? "storage_not_configured" : "upload_failed" },
    { status: 503 },
  );
}

export async function POST(request: Request) {
  if (!storageConfigured()) {
    return NextResponse.json({ error: "storage_not_configured" }, { status: 503 });
  }
  if (!isFactoryUploadAuthed(request.headers.get("cookie"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as UploadBody | null;
  const type = body?.type;
  if (!body || (type !== "sign" && type !== "complete")) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    if (type === "sign") {
      const filename = typeof body.filename === "string" ? body.filename : "";
      if (!isPlayableFactoryVideoName(filename)) {
        return NextResponse.json({ error: "mp4_only" }, { status: 400 });
      }
      const declared =
        typeof body.contentType === "string" && (FACTORY_VIDEO_TYPES as readonly string[]).includes(body.contentType)
          ? body.contentType
          : FACTORY_VIDEO_TYPES[0];
      const current = await listFactoryVideos();
      if (current.length >= FACTORY_VIDEO_MAX_COUNT) {
        return NextResponse.json({ error: "limit" }, { status: 400 });
      }
      const path = `${VIDEO_PREFIX}${randomUUID()}.${extensionFrom(filename, declared)}`;
      const signed = await createSignedUpload(path);
      return NextResponse.json(
        {
          ok: true,
          path: signed.path,
          signedUrl: signed.signedUrl,
          token: signed.token,
          url: signed.url,
          contentType: declared,
          maxBytes: FACTORY_VIDEO_MAX_BYTES,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const path = typeof body.path === "string" ? body.path : "";
    if (!path.startsWith(VIDEO_PREFIX) || path.includes("..") || path.length > 200) {
      return NextResponse.json({ error: "invalid_path" }, { status: 400 });
    }
    // The object has to exist before it is announced on the homepage: a stale
    // manifest entry would render a broken player.
    const existing = await listMedia(VIDEO_PREFIX, 200);
    if (!existing.some((entry) => entry.path === path)) {
      return NextResponse.json({ error: "missing_object" }, { status: 409 });
    }
    const title = typeof body.title === "string" ? body.title : "";
    const video: FactoryVideo = {
      id: randomUUID(),
      url: mediaPublicUrl(path),
      title: sanitizeFactoryVideoTitle(title),
      createdAt: new Date().toISOString(),
    };
    const videos = await addFactoryVideo(video);
    return NextResponse.json(
      { ok: true, video, videos },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
