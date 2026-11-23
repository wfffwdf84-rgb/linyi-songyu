import type { MetadataRoute } from "next";
import { sliceSitemapShard, sitemapEntries, sitemapShardCount } from "@/lib/sitemap";

/**
 * Built on every request.
 *
 * A sitemap prerendered at build time never learns about a product added in the
 * panel: revalidatePath() expires the page cache rather than that file, and a
 * revalidate window did not reliably regenerate it behind the CDN either. The
 * document is a few hundred kilobytes of cheap string work and search engines
 * fetch it a handful of times a day, so generating it fresh is the honest
 * trade: a new product is in the sitemap the moment its page is live.
 *
 * The list is sharded with generateSitemaps(): this file serves
 * `/sitemap/<n>.xml` (n is 1-based) holding one slice of SITEMAP_SHARD_SIZE
 * URLs, and `/sitemap.xml` is the index over those shards - see
 * `src/app/sitemap-index.xml/route.ts`. `dynamic` is re-exported by the
 * generated sitemap route, so the shards are rendered per request exactly like
 * the single-file sitemap was.
 */
export const dynamic = "force-dynamic";

/**
 * Tells Next.js how many shard documents exist. The count follows the catalogue,
 * so the shards and the index grow together when products are added.
 */
export async function generateSitemaps() {
  const count = sitemapShardCount((await sitemapEntries()).length);
  return Array.from({ length: count }, (_, index) => ({ id: index + 1 }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const shard = Number.parseInt(await props.id, 10);
  // A shard id that is not a positive integer never matched a shard; hand back
  // nothing rather than the first slice, so a bad URL cannot look like data.
  if (!Number.isInteger(shard) || shard < 1) return [];

  const entries = await sitemapEntries();
  return sliceSitemapShard(entries, shard);
}
