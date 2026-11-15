import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { editorOnly } from "@/lib/admin-guard";
import { productStorageConfigured } from "@/lib/product-store";
import { uploadMedia } from "@/lib/supabase";

/** 5 MB of actual image bytes. Enforced after reading, never on the header. */
const MAX_BYTES = 5 * 1024 * 1024;

type ImageKind = "jpg" | "png" | "webp";

const DECLARED_TYPES: Record<string, ImageKind> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const CONTENT_TYPES: Record<ImageKind, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;

function ascii(bytes: Uint8Array, start: number, length: number) {
  if (bytes.length < start + length) return "";
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

/**
 * Reads the file signature. The Content-Type is whatever the browser claims;
 * the first bytes are what actually gets rendered, and they are what this route
 * trusts. A PNG renamed to .jpg is rejected rather than stored.
 */
function sniffImageKind(bytes: Uint8Array): ImageKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    ascii(bytes, 1, 3) === "PNG" &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return "webp";
  }
  return null;
}

/** The slug only shapes the filename; a bad one falls back, it never fails upload. */
function slugFrom(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "product";
  const slug = value.trim().toLowerCase();
  return SLUG_PATTERN.test(slug) ? slug : "product";
}

export async function POST(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  if (!productStorageConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });
  }
  if (!Object.hasOwn(DECLARED_TYPES, file.type)) {
    return NextResponse.json({ ok: false, error: "unsupported_type" }, { status: 415 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  // The limit is the byte count that will actually be stored.
  if (bytes.byteLength === 0) {
    return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });
  }
  if (bytes.byteLength > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
  }

  const kind = sniffImageKind(bytes);
  if (!kind || DECLARED_TYPES[file.type] !== kind) {
    return NextResponse.json({ ok: false, error: "unsupported_type" }, { status: 415 });
  }

  // The random suffix makes the object immutable, which is what the one-year
  // cache control handed to Supabase rests on.
  const pathname = `products/${slugFrom(form.get("slug"))}-${randomBytes(4).toString("hex")}.${kind}`;

  try {
    const uploaded = await uploadMedia(pathname, bytes, CONTENT_TYPES[kind]);
    return NextResponse.json(
      { ok: true, url: uploaded.url, pathname: uploaded.path, bytes: bytes.byteLength },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("product image upload failed", error);
    return NextResponse.json({ ok: false, error: "upload_failed" }, { status: 500 });
  }
}
