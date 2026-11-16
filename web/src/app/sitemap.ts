import type { MetadataRoute } from "next";
import { categories } from "@/lib/data/categories";
import { getPublicProducts } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";
import { appLocales, localePath } from "@/lib/locales";

/**
 * Built on every request.
 *
 * A sitemap prerendered at build time never learns about a product added in the
 * panel: revalidatePath() expires the page cache rather than that file, and a
 * revalidate window did not reliably regenerate it behind the CDN either. The
 * document is a few hundred kilobytes of cheap string work and search engines
 * fetch it a handful of times a day, so generating it fresh is the honest
 * trade: a new product is in the sitemap the moment its page is live.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
