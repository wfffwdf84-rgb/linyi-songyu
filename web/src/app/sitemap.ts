import type { MetadataRoute } from "next";
import { categories } from "@/lib/data/categories";
import { getAllProductPaths } from "@/lib/data/products";
import { siteConfig } from "@/lib/site";
import { appLocales, localePath } from "@/lib/locales";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

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
    ...getAllProductPaths().map(({ category, slug }) => `/parts/${category}/${slug}`),
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
