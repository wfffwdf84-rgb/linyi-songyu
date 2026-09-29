import { NextResponse } from "next/server";
import { suggestProducts } from "@/lib/data/products";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const trimmed = q.trim();
  const min = /[\u4e00-\u9fff]/.test(trimmed) ? 1 : 2;
  if (trimmed.length < min) {
    return NextResponse.json({ items: [] });
  }
  return NextResponse.json({ items: suggestProducts(trimmed, 8) });
}
