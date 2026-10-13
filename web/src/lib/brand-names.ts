/**
 * Brand names are proper nouns, so they stay Latin on every locale — except
 * Chinese, where buyers know the Chinese name. The category filters already
 * show 临工, so product pages reading "SDLG" was inconsistent.
 *
 * Only names that are certain go in here; anything missing falls back to the
 * Latin brand as-is.
 */
const ZH_NAMES: Record<string, string> = {
  SDLG: "临工",
  Liugong: "柳工",
  XCMG: "徐工",
  XGMA: "厦工",
  Changlin: "常林",
  Lonking: "龙工",
  LOVOL: "雷沃",
  Chenggong: "成工",
  Doosan: "斗山",
  Daewoo: "大宇",
  Kobelco: "神钢",
  Yuchai: "玉柴",
  SANY: "三一",
  Shantui: "山推",
  ZF: "采埃孚",
  Songyu: "松昱",
};

/** Display name for one brand. The stored value is never changed. */
export function brandLabel(brand: string, locale: string): string {
  if (locale !== "zh") return brand;
  return ZH_NAMES[brand] ?? brand;
}

/** "Doosan / Daewoo" reads as "斗山 / 大宇" on a Chinese page. */
export function brandListLabel(brands: string[], locale: string): string {
  return brands.map((brand) => brandLabel(brand, locale)).join(" / ");
}
