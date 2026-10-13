import { NextResponse } from "next/server";
import { suggestProducts } from "@/lib/data/products";
import { isAppLocale } from "@/lib/locales";
import { productName } from "@/lib/translated";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const trimmed = (params.get("q") ?? "").trim();
  const min = /[\u4e00-\u9fff]/.test(trimmed) ? 1 : 2;
  if (trimmed.length < min) {
    return NextResponse.json({ items: [] });
  }

  // The suggestion dropdown is rendered in the visitor's language, so the
  // lookup happens here — the translation table is far too big to ship to the
  // browser, and this route already runs on the server.
  const requested = params.get("locale") ?? "";
  const locale = isAppLocale(requested) ? requested : "en";

  const items = suggestProducts(trimmed, 8, locale).map((hit) => ({
    ...hit,
    name: productName(locale, hit.name),
  }));
  return NextResponse.json({ items });
}
