import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/api/admin",
        "/api/admin/",
        "/admin",
        "/admin/",
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
