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

/**
 * Internal tools are not content: they must open at the URL that was typed, not
 * at whichever locale the edge maps the operator's country to.
 */
const INTERNAL_PREFIXES = ["manage-factory-videos", "inquiry-desk", "admin"];

/**
 * The operations panel is the one internal tool that lives outside the
 * `[locale]` tree, so it must never receive a locale prefix: `/admin` has to
 * stay `/admin`, otherwise the route it actually matches no longer exists.
 */
const LOCALE_FREE_PREFIXES = ["admin"];

/**
 * Carries the typed path to the admin layout, which cannot read the pathname of
 * a server component and needs it to tell /admin/login from the guarded pages.
 */
const ADMIN_PATH_HEADER = "x-admin-path";

function matchesPrefix(barePath: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => barePath === `/${prefix}` || barePath.startsWith(`/${prefix}/`),
  );
}

function isInternalTool(barePath: string) {
  return matchesPrefix(barePath, INTERNAL_PREFIXES);
}

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

  const bare = stripAnyLocalePrefix(pathname);

  // The operations panel is not part of the localized site at all: skip locale
  // detection and the intl middleware, and hand the path to the admin layout.
  if (matchesPrefix(bare, LOCALE_FREE_PREFIXES)) {
    if (bare !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = bare;
      return NextResponse.redirect(url, 308);
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(ADMIN_PATH_HEADER, bare);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const urlLocale = pathLocalePrefix(pathname);
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const preferred = isAppLocale(cookieLocale) ? cookieLocale : undefined;

  const desired: AppLocale =
    preferred ?? urlLocale ?? localeFromCountry(readCountryCode(request.headers));

  // Strip whatever locale the URL already carries - including a written-out
  // default one such as the `/en` in `/en/parts` - before applying the desired
  // locale, or a second prefix gets bolted on and the URL 404s.
  const target = isInternalTool(bare) ? (urlLocale ?? desired) : desired;
  const targetPath = withLocalePrefix(bare, target);
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
