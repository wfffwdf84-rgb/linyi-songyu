import { NextResponse } from "next/server";
import { factoryUploadConfigured, isFactoryUploadAuthed } from "@/lib/factory-video-auth";
import { factoryVideoObjectStorageReady, factoryVideoStorageReady } from "@/lib/factory-video-store";

export async function GET(request: Request) {
  const authed = isFactoryUploadAuthed(request.headers.get("cookie"));
  return NextResponse.json(
    {
      configured: factoryUploadConfigured(),
      authed,
      // `storage` means "a clip can be kept somewhere"; `direct` means "the
      // browser can send it straight to Supabase". Outside Vercel the local disk
      // is the store, so `storage` can be true while `direct` is false.
      storage: authed ? factoryVideoStorageReady() : false,
      direct: authed ? factoryVideoObjectStorageReady() : false,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
