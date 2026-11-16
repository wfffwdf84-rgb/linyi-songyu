import type { MetadataRoute } from "next";
import { categories } from "@/lib/data/categories";
import { getPublicProducts } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";
import { appLocales, localePath } from "@/lib/locales";

/**
 * A sitemap generated purely at build time never learns about a product added
 * in the panel: revalidatePath() expires the page cache, not the file written
 * during the build. Hourly regeneration fixes the drift on its own, and the
 * admin's revalidatePath("/sitemap.xml") then refreshes it on demand.
 */
export const revalidate = 300;

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
