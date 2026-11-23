import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site";
import { sitemapEntries, sitemapShardCount } from "@/lib/sitemap";

/**
 * The sitemap index over the shards served by `src/app/sitemap.ts` at
 * `/sitemap/<n>.xml`.
 *
 * Next.js shards the sitemap documents when `generateSitemaps()` is exported but
 * does not emit an index for them, and a route handler living at
 * `app/sitemap.xml/route.ts` collides with the sitemap metadata route ("Conflicting
 * route and metadata at /sitemap.xml"), so the index lives here and `next.config.ts`
 * rewrites `/sitemap.xml` to this path. `robots.txt` keeps pointing at
 * `/sitemap.xml`, which is also where every previously submitted sitemap points.
 *
 * It is dynamic for the same reason the shards are: the number of shards follows
 * the catalogue, so a product added in the panel can introduce a sixth shard
 * without a rebuild.
 */
export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });
}

export async function GET() {
  const count = sitemapShardCount((await sitemapEntries()).length);
  const lastModified = new Date().toISOString();

  const shards = Array.from(
    { length: count },
    (_, index) => `  <sitemap>
    <loc>${escapeXml(`${siteConfig.url}/sitemap/${index + 1}.xml`)}</loc>
    <lastmod>${lastModified}</lastmod>
  </sitemap>`,
  ).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${shards}
</sitemapindex>
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
