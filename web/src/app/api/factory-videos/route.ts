import { NextResponse } from "next/server";
import { listFactoryVideos } from "@/lib/factory-video-store";
import { factoryVideoPublicSrc } from "@/lib/factory-videos";
import { localeFromCountry, readCountryCode } from "@/lib/geo-locale";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const videos = await listFactoryVideos();
  const locale = localeFromCountry(readCountryCode(request.headers));
  return NextResponse.json(
    {
      locale,
      videos: videos.map((video) => ({
        ...video,
        url: factoryVideoPublicSrc(video.id, video.url),
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
