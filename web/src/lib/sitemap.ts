import type { MetadataRoute } from "next";
import { categories } from "@/lib/data/categories";
import { getPublicProducts } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";
import { appLocales, localePath } from "@/lib/locales";

/**
 * The one flat, deterministic list of every public URL, shared by the sharded
 * sitemap routes (`src/app/sitemap.ts`) and the sitemap index
 * (`src/app/sitemap-index.xml/route.ts`).
 *
 * Order matters: locale-major, then the static pages, the category pages and
 * finally every product. Sharding slices this array, so for a given catalogue
 * every URL lands in exactly one shard - no duplicates, no gaps. The catalogue
 * is read through `getPublicProducts()`, so a delisted product is already gone
 * and a product added in the panel is in the next response.
 */

/** Google allows 50,000 URLs per sitemap; 5,000 keeps each document small. */
export const SITEMAP_SHARD_SIZE = 5_000;

export type SitemapEntry = MetadataRoute.Sitemap[number];

export async function sitemapEntries(): Promise<SitemapEntry[]> {
  const base = siteConfig.url;

  // Delisted products are already gone from the public loader, so they drop out
  // of the sitemap without a second filter.
  const products = await getPublicProducts();

  const paths = [
    "",
    "/parts",
    "/about",
    "/contact",
    "/quality-logistics",
    "/request-quote",
    "/upload-video",
    "/shipping",
    "/payment",
    "/privacy",
    "/terms",
    ...categories.map((cat) => `/parts/${cat.slug}`),
    ...products.map((product) => `/parts/${product.categorySlug}/${product.slug}`),
  ];

  const languageMap = (path: string) =>
    Object.fromEntries(
      appLocales.map((locale) => [locale, `${base}${localePath(locale, path || "/")}`]),
    );

  return appLocales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${base}${localePath(locale, path || "/")}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: languageMap(path),
      },
    })),
  );
}

/**
 * Number of shards a URL list needs. Always at least one: an empty catalogue
 * still ships a well-formed (empty) sitemap rather than none at all.
 */
export function sitemapShardCount(total: number): number {
  return Math.max(1, Math.ceil(total / SITEMAP_SHARD_SIZE));
}

/**
 * One shard of the list, 1-based. The shards are consecutive windows over the
 * same array, so shard 1 through `sitemapShardCount(length)` covers every entry
 * exactly once - that is what makes the split duplicate-free and gap-free.
 */
export function sliceSitemapShard(entries: SitemapEntry[], shard: number): SitemapEntry[] {
  const start = (shard - 1) * SITEMAP_SHARD_SIZE;
  return entries.slice(start, start + SITEMAP_SHARD_SIZE);
}
