import { NextResponse } from "next/server";
import { factoryUploadConfigured, isFactoryUploadAuthed } from "@/lib/factory-video-auth";
import { factoryVideoStorageReady } from "@/lib/factory-video-store";

export async function GET(request: Request) {
  const authed = isFactoryUploadAuthed(request.headers.get("cookie"));
  return NextResponse.json(
    {
      configured: factoryUploadConfigured(),
      authed,
      storage: authed ? factoryVideoStorageReady() : false,
      blob: authed ? Boolean(process.env.BLOB_READ_WRITE_TOKEN) : false,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
