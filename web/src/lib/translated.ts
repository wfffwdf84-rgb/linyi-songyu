import translations from "@/lib/data/product-translations.json";

type Dictionary = Record<string, string>;
type Table = Record<string, Dictionary> & { __labels?: string[] };

const table = translations as unknown as Table;
const catalogLabels = table.__labels ?? [];

/**
 * Localised copy for catalogue text that only exists in English and Chinese.
 * Falls back to English, so a missing entry never breaks a page.
 */
export function tr(locale: string, english: string, chinese?: string): string {
  if (locale === "en") return english;
  if (locale === "zh") return chinese ?? english;
  return table[locale]?.[english] ?? english;
}

/**
 * Catalogue entries build their name as "<brand> <machine> <type>". Translating
 * 256 composed names would repeat the same type word over and over, so the
 * English type label is swapped for the localised one instead. Only used when
 * the whole name had no entry of its own.
 */
function swapCatalogLabel(locale: string, name: string) {
  const dictionary = table[locale];
  if (!dictionary) return name;
  for (const label of catalogLabels) {
    if (name.endsWith(label)) {
      const localised = dictionary[label];
      if (localised) return name.slice(0, name.length - label.length) + localised;
    }
  }
  return name;
}

type Localised = { en: string; zh: string };

/** Product name in the visitor's language, with an English fallback. */
export function productName(locale: string, name: Localised): string {
  if (locale === "en") return swapCatalogLabel(locale, name.en);
  if (locale === "zh") return name.zh;
  const direct = table[locale]?.[name.en];
  return direct ?? swapCatalogLabel(locale, name.en);
}

/** The boilerplate sentence every catalogue entry shares. */
const CATALOG_TAIL = "In stock at Linyi hub.";

/**
 * Product description in the visitor's language, with an English fallback.
 * Catalogue entries share one generated sentence, so instead of translating 256
 * near-identical strings the localised name is followed by the translated tail.
 */
export function productDescription(
  locale: string,
  description: Localised,
  name?: Localised,
): string {
  const direct = table[locale]?.[description.en];
  if (direct) return direct;
  if (locale !== "en" && locale !== "zh" && name) {
    const tail = table[locale]?.[CATALOG_TAIL];
    if (tail) return `${productName(locale, name)}. ${tail}`;
  }
  return tr(locale, description.en, description.zh);
}
