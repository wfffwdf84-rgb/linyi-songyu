export const appLocales = [
  "en", "zh", "ar", "fr", "th", "id", "vi", "ms", "pt", "ru", "ko", "ja", "es",
] as const;

export type AppLocale = (typeof appLocales)[number];

export const defaultLocale: AppLocale = "en";

export const localeNames: Record<AppLocale, string> = {
  en: "English",
  zh: "中文",
  ar: "العربية",
  fr: "Français",
  th: "ไทย",
  id: "Indonesia",
  vi: "Tiếng Việt",
  ms: "Melayu",
  pt: "Português",
  ru: "Русский",
  ko: "한국어",
  ja: "日本語",
  es: "Español",
};

export const localeHtmlLang: Record<AppLocale, string> = {
  en: "en",
  zh: "zh-CN",
  ar: "ar",
  fr: "fr",
  th: "th",
  id: "id",
  vi: "vi",
  ms: "ms",
  pt: "pt",
  ru: "ru",
  ko: "ko",
  ja: "ja",
  es: "es",
};

export const localeOg: Record<AppLocale, string> = {
  en: "en_US",
  zh: "zh_CN",
  ar: "ar_SA",
  fr: "fr_FR",
  th: "th_TH",
  id: "id_ID",
  vi: "vi_VN",
  ms: "ms_MY",
  pt: "pt_AO",
  ru: "ru_RU",
  ko: "ko_KR",
  ja: "ja_JP",
  es: "es_ES",
};

export const rtlLocales: ReadonlySet<string> = new Set(["ar"]);

export function isAppLocale(value: string | undefined): value is AppLocale {
  return !!value && (appLocales as readonly string[]).includes(value);
}

export function localePath(locale: string, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!isAppLocale(locale) || locale === defaultLocale) return normalized;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function pathLocalePrefix(pathname: string): AppLocale | null {
  for (const locale of appLocales) {
    if (locale === defaultLocale) continue;
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) return locale;
  }
  return null;
}

export function stripLocalePrefix(pathname: string) {
  const locale = pathLocalePrefix(pathname);
  if (!locale) return pathname;
  const rest = pathname.slice(locale.length + 1);
  return rest.length > 0 ? rest : "/";
}

export function withLocalePrefix(pathname: string, locale: AppLocale) {
  const stripped = stripLocalePrefix(pathname);
  if (locale === defaultLocale) return stripped;
  return stripped === "/" ? `/${locale}` : `/${locale}${stripped}`;
}

/**
 * stripLocalePrefix also removes written-out locale prefixes, including the
 * default one, and repeats until none is left: `/ms/en/parts` becomes `/parts`.
 *
 * pathLocalePrefix deliberately ignores the default locale: it only reports a
 * prefix that has to appear in the URL. That leaves `/en` looking like an
 * ordinary path segment, so adding another locale produced `/ms/en`, a URL no
 * route matches. The loop also repairs those URLs, which the earlier behaviour
 * handed out and search engines may still hold.
 *
 * Safe to repeat because no real route carries two locale segments: the shape
 * is always `/<locale>/parts/...`.
 */
export function stripAnyLocalePrefix(pathname: string) {
  let rest = pathname;
  for (;;) {
    const stripped = stripLocalePrefix(rest);
    if (stripped !== rest) {
      rest = stripped;
      continue;
    }
    if (rest === `/${defaultLocale}`) return "/";
    if (rest.startsWith(`/${defaultLocale}/`)) {
      rest = rest.slice(defaultLocale.length + 1);
      continue;
    }
    return rest;
  }
}

/**
 * Collapses a doubled locale prefix such as `/zh/zh` or `/zh/zh/parts` down to
 * `/zh` or `/zh/parts`.
 *
 * A stale client-side pathname that already carries the prefix can produce
 * these URLs - for example when the locale in the URL and the locale the client
 * thinks it is on disagree, so the prefix is added a second time. They match no
 * route and would otherwise render a 404.
 */
export function collapseDuplicateLocalePrefix(pathname: string) {
  const segments = pathname.split("/");
  const first = segments[1];
  if (!first || first !== segments[2]) return pathname;
  if (!isAppLocale(first)) return pathname;
  return `/${segments.slice(2).join("/")}`;
}

export function languageAlternateHrefs(path = "/") {
  const map: Record<string, string> = { "x-default": localePath(defaultLocale, path) };
  for (const locale of appLocales) {
    map[localeHtmlLang[locale]] = localePath(locale, path);
  }
  return map;
}

export function pageAlternates(locale: string, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: languageAlternateHrefs(path),
  };
}

export function localeFontClass(locale: string) {
  if (locale === "zh") return "font-zh";
  if (locale === "ar") return "font-ar";
  if (locale === "th") return "font-th";
  if (locale === "ko") return "font-ko";
  if (locale === "ja") return "font-ja";
  return "";
}
