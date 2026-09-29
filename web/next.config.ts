import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com",
      "media-src 'self' blob: https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com",
      "connect-src 'self' https://vercel.com https://*.blob.vercel-storage.com https://*.public.blob.vercel-storage.com https://blob.vercel-storage.com",
      "frame-src 'self' https://www.openstreetmap.org https://uri.amap.com https://*.amap.com",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["ffmpeg-static"],
  outputFileTracingIncludes: {
    "/api/factory-videos/repair": ["./node_modules/ffmpeg-static/**"],
    "/api/factory-videos/register": ["./node_modules/ffmpeg-static/**"],
  },
  images: {
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/parts/lubrication-parts",
        destination: "/parts",
        permanent: true,
      },
      {
        source: "/parts/lubrication-parts/:path*",
        destination: "/parts",
        permanent: true,
      },
      {
        source: "/:locale(zh|ar|fr|th|id|vi|ms|pt|ru|ko|ja|es)/parts/lubrication-parts",
        destination: "/:locale/parts",
        permanent: true,
      },
      {
        source: "/:locale(zh|ar|fr|th|id|vi|ms|pt|ru|ko|ja|es)/parts/lubrication-parts/:path*",
        destination: "/:locale/parts",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/manage-factory-videos",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:locale/manage-factory-videos",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
