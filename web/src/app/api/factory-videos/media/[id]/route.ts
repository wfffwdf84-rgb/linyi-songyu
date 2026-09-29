import { getFactoryVideo } from "@/lib/factory-video-store";
import { isAllowedFactoryVideoUrl } from "@/lib/factory-video-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Props) {
  const { id } = await params;
  if (!id || id.length > 80 || /[^\w.-]/.test(id)) {
    return new Response("not_found", { status: 404 });
  }

  const video = await getFactoryVideo(id);
  if (!video) return new Response("not_found", { status: 404 });

  if (video.url.startsWith("/")) {
    return Response.redirect(new URL(video.url, request.url), 302);
  }
  if (!isAllowedFactoryVideoUrl(video.url)) {
    return new Response("invalid_source", { status: 400 });
  }

  const range = request.headers.get("range");
  const upstream = await fetch(video.url, {
    cache: "no-store",
    headers: range ? { Range: range } : undefined,
  });
  if (!upstream.ok && upstream.status !== 206) {
    return new Response("unavailable", { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") || "video/mp4");
  headers.set("Accept-Ranges", upstream.headers.get("accept-ranges") || "bytes");
  headers.set("Cache-Control", "public, max-age=3600");
  const contentRange = upstream.headers.get("content-range");
  if (contentRange) headers.set("Content-Range", contentRange);
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(upstream.body, { status: upstream.status, headers });
}
