import type { MetadataRoute } from "next";
import { categories } from "@/lib/data/categories";
import { getAllProductPaths } from "@/lib/data/products";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const locales = ["", "/zh"];

  const paths = [
    "",
    "/parts",
    "/quality-logistics",
    "/request-quote",
    ...categories.map((cat) => `/parts/${cat.slug}`),
    ...getAllProductPaths().map(({ category, slug }) => `/parts/${category}/${slug}`),
  ];

  return locales.flatMap((prefix) =>
    paths.map((path) => ({
      url: `${base}${prefix}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: {
          en: `${base}${path}`,
          zh: `${base}/zh${path}`,
        },
      },
    })),
  );
}
