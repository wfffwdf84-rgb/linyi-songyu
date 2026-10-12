import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/manage-factory-videos",
        "/*/manage-factory-videos",
        "/manage-factory-videos/",
        "/*/manage-factory-videos/",
        "/inquiry-desk",
        "/*/inquiry-desk",
        "/inquiry-desk/",
        "/*/inquiry-desk/",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
