export function loc(locale: string, en: string, zh: string) {
  return locale === "zh" ? zh : en;
}
