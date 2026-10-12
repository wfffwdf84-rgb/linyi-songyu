import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { localeFromCountry, readCountryCode } from "@/lib/geo-locale";
import {
  collapseDuplicateLocalePrefix,
  isAppLocale,
  pathLocalePrefix,
  stripAnyLocalePrefix,
  withLocalePrefix,
  type AppLocale,
} from "@/lib/locales";

const intlMiddleware = createMiddleware(routing);

const LOCALE_COOKIE = "NEXT_LOCALE";
const cookieOptions = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // A stale client pathname can double the locale prefix (`/zh/zh`). Collapse it
  // before anything else so the URL resolves instead of 404ing.
  const collapsed = collapseDuplicateLocalePrefix(pathname);
  if (collapsed !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = collapsed;
    return NextResponse.redirect(url, 308);
  }

  const urlLocale = pathLocalePrefix(pathname);
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const preferred = isAppLocale(cookieLocale) ? cookieLocale : undefined;

  const desired: AppLocale =
    preferred ?? urlLocale ?? localeFromCountry(readCountryCode(request.headers));

  // Strip whatever locale the URL already carries - including a written-out
  // default one such as the `/en` in `/en/parts` - before applying the desired
  // locale, or a second prefix gets bolted on and the URL 404s.
  const targetPath = withLocalePrefix(stripAnyLocalePrefix(pathname), desired);
  if (targetPath !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, desired, cookieOptions);
    return response;
  }

  const response = intlMiddleware(request);
  if (pathname.includes("manage-factory-videos")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  if (!preferred) {
    response.cookies.set(LOCALE_COOKIE, desired, cookieOptions);
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
