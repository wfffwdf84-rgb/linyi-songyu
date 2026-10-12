/**
 * Social crawlers (WhatsApp, Facebook, LinkedIn) do not render WebP for
 * og:image, so every product photo gets a JPEG social card at /og/<name>.jpg
 * generated alongside it. Pages keep serving WebP to browsers.
 */
export function socialCard(image: string): string {
  const file = image.split("/").pop() ?? "";
  return `/og/${file.replace(/\.[a-z0-9]+$/i, ".jpg")}`;
}
