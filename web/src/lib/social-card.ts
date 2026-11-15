import { siteConfig } from "@/lib/site";

/**
 * Social crawlers (WhatsApp, Facebook, LinkedIn) do not render WebP for
 * og:image, so every product photo gets a JPEG social card at /og/<name>.jpg
 * generated alongside it. Pages keep serving WebP to browsers.
 *
 * Only `/images/products/<file>` has a generated card. Anything else - an
 * uploaded Blob URL, a path outside the catalogue, a malformed value - falls
 * back to the site's own share image instead of composing a URL that 404s.
 */
const SITE_LOGO = siteConfig.logo;

/** Matches the only product-image family that has pre-rendered /og JPEGs. */
const CATALOG_IMAGE = /^\/images\/products\/([A-Za-z0-9._-]+)\.(?:webp|jpe?g|png)$/i;

export function socialCard(image: string): string {
  const match = image.trim().match(CATALOG_IMAGE);
  if (!match) return SITE_LOGO;
  const stem = match[1].replace(/\.[A-Za-z0-9]+$/, "");
  if (!stem) return SITE_LOGO;
  return `/og/${stem}.jpg`;
}

/**
 * An absolute image URL for structured data. A site path is prefixed with the
 * canonical origin; an uploaded https URL is already absolute.
 */
export function absoluteImageUrl(image: string): string {
  const trimmed = image.trim();
  if (!trimmed) return `${siteConfig.url}${SITE_LOGO}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${siteConfig.url}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}
