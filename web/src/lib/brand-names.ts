/**
 * Brand names are proper nouns, so they stay Latin on every locale — except
 * Chinese, where buyers know the Chinese name. The catalogue was imported in
 * three batches, so the same brand is stored as "Liugong" in one batch and
 * "LiuGong" in the next, "LOVOL" here and "Lovol" there, and "Daewoo" once had
 * a mistyped "大字". Left alone, one brand becomes several filter chips and a
 * Chinese page shows a mixture of Chinese and Latin names.
 *
 * This module is the single source of truth for that: every stored value is
 * resolved to a canonical key (what links carry), and the key resolves to one
 * display name per locale. Nothing here changes the stored product data.
 */

type BrandEntry = {
  /** Canonical Latin spelling shown on every non-Chinese locale. */
  en: string;
  /** Chinese name shown on the Chinese site; omitted where the brand is not translated. */
  zh?: string;
  /** Other spellings seen in the catalogue, the sidebar data, or a pasted URL. */
  aliases?: string[];
};

/**
 * Keyed by canonical key. The key is the Latin name lowercased with spaces and
 * punctuation removed, so `?brand=liugong` is the one address for the brand.
 */
const BRANDS: Record<string, BrandEntry> = {
  advance: { en: "Advance", zh: "杭齿" },
  caterpillar: {
    en: "Caterpillar",
    zh: "卡特",
    aliases: ["CAT", "Cat", "卡特彼勒", "卡特皮勒"],
  },
  cem: { en: "CEM", zh: "山" },
  changlin: { en: "Changlin", zh: "常林" },
  chenggong: { en: "Chenggong", zh: "成工" },
  daewoo: { en: "Daewoo", zh: "大宇", aliases: ["大字"] },
  doosan: { en: "Doosan", zh: "斗山" },
  ensign: { en: "Ensign", zh: "英轩" },
  foton: { en: "Foton", zh: "福田" },
  hangtiantaite: { en: "Hangtian Taite", zh: "航天泰特" },
  hengte: { en: "Hengte", zh: "恒特" },
  hitachi: { en: "Hitachi", zh: "日立" },
  hyundai: { en: "Hyundai", zh: "现代" },
  ihi: { en: "IHI", zh: "石川岛" },
  jcb: { en: "JCB", zh: "JCB" },
  kaiyuan: { en: "Kaiyuan", zh: "开滦" },
  kato: { en: "Kato", zh: "加藤" },
  kobelco: { en: "Kobelco", zh: "神钢" },
  komatsu: { en: "Komatsu", zh: "小松" },
  liebherr: { en: "Liebherr", zh: "利勃海尔" },
  lishide: { en: "Lishide", zh: "力士德" },
  liugong: { en: "LiuGong", zh: "柳工", aliases: ["Liugong", "柳工"] },
  lonking: { en: "Lonking", zh: "龙工" },
  lovol: { en: "LOVOL", zh: "雷沃", aliases: ["Lovol", "福田雷沃"] },
  sany: { en: "SANY", zh: "三一" },
  sdlg: { en: "SDLG", zh: "临工", aliases: ["山东临工"] },
  sem: { en: "SEM", zh: "山工" },
  shantui: { en: "Shantui", zh: "山推" },
  somer: { en: "Somer", zh: "索玛" },
  songyu: { en: "Songyu", zh: "松昱" },
  sumitomo: { en: "Sumitomo", zh: "住友" },
  sunward: { en: "Sunward", zh: "山河智能" },
  volvo: { en: "Volvo", zh: "沃尔沃" },
  // A product series used as a brand in the imported data; there is no Chinese
  // name to show, so it stays Latin on both sites.
  vrt: { en: "VRT" },
  wode: { en: "Wode", zh: "沃德" },
  xcmg: { en: "XCMG", zh: "徐工" },
  xgma: { en: "XGMA", zh: "厦工" },
  xinyuan: { en: "Xinyuan", zh: "新原" },
  yanmar: { en: "Yanmar", zh: "洋马" },
  yuchai: { en: "Yuchai", zh: "玉柴" },
  yunyu: { en: "Yunyu", zh: "肥城" },
  zf: { en: "ZF", zh: "采埃孚" },
  zoomlion: { en: "Zoomlion", zh: "中联重科" },

  /* Brands that came in with the 2026 radiator / intercooler catalogue: truck
   * makers (the alu-plastic and intercooler pages) and the smaller Chinese
   * machine builders that only appear in the "Others" pages of the PDF. Where
   * the Chinese name is not confirmed the entry keeps the Latin spelling, which
   * is what the Chinese site showed for those rows before. */
  aotai: { en: "Aotai" },
  auman: { en: "Auman", zh: "欧曼" },
  baoding: { en: "Baoding" },
  beiben: { en: "Beiben", zh: "北奔" },
  case: { en: "CASE", zh: "凯斯" },
  danyang: { en: "Danyang" },
  dayun: { en: "Dayun", zh: "大运" },
  dongfeng: { en: "Dongfeng", zh: "东风" },
  dongfengliuzhou: { en: "Dongfeng Liuzhou", zh: "东风柳汽", aliases: ["DONGFENG LIUZHOU"] },
  farizon: { en: "Farizon", zh: "远程" },
  faw: { en: "FAW", zh: "一汽" },
  hongyangenglyon: { en: "Hongyan Genlyon", zh: "上汽红岩", aliases: ["HONGYAN GENLYON", "Hongyan"] },
  howo: { en: "HOWO", zh: "豪沃" },
  hualing: { en: "Hualing", zh: "华菱" },
  jac: { en: "JAC", zh: "江淮" },
  jcm: { en: "JCM" },
  jincheng: { en: "Jincheng", zh: "金城" },
  jingong: { en: "Jingong", zh: "晋工" },
  kubota: { en: "Kubota", zh: "久保田" },
  longtai: { en: "Longtai", zh: "龙泰" },
  north: { en: "North" },
  pengpu: { en: "Pengpu", zh: "彭浦" },
  pushi: { en: "Pushi" },
  rhino: { en: "Rhino" },
  shacman: { en: "Shacman", zh: "陕汽", aliases: ["Shanqi"] },
  sinotruk: { en: "Sinotruk", zh: "中国重汽", aliases: ["中国重汽", "SINOTRUK"] },
  takeuchi: { en: "Takeuchi", zh: "竹内" },
  tonly: { en: "Tonly", zh: "同力" },
  unbranded: { en: "Unbranded", zh: "未标注品牌" },
  united: { en: "United" },
  world: { en: "World" },
  xuanhua: { en: "Xuanhua", zh: "宣化" },
  yutong: { en: "Yutong", zh: "宇通" },
  zhanyang: { en: "Zhanyang", zh: "詹阳" },
  zhenyu: { en: "Zhenyu" },
  zhongtong: { en: "Zhongtong", zh: "中通" },
};

/**
 * Case, spacing and light punctuation are not part of a brand's identity: the
 * importer wrote "Hangtian Taite" and "Kaiyuan" where the sidebar writes
 * "SDLG" and "LOVOL".
 */
function normalizeBrandName(value: string): string {
  return value.trim().toLowerCase().replace(/[\s._\-/]+/g, "");
}

const ALIAS_TO_KEY = new Map<string, string>();
for (const [key, entry] of Object.entries(BRANDS)) {
  ALIAS_TO_KEY.set(normalizeBrandName(key), key);
  ALIAS_TO_KEY.set(normalizeBrandName(entry.en), key);
  // A Chinese name is a valid stored value too: the sidebar data and a few
  // imported rows use one, and it must filter exactly like the Latin spelling.
  if (entry.zh) ALIAS_TO_KEY.set(normalizeBrandName(entry.zh), key);
  for (const alias of entry.aliases ?? []) ALIAS_TO_KEY.set(normalizeBrandName(alias), key);
}

/**
 * The canonical key for a stored brand value. Unknown brands keep their own
 * normalised spelling as the key, so a new brand still filters correctly
 * without a code change.
 */
export function brandKey(brand: string): string {
  const normalized = normalizeBrandName(brand);
  if (!normalized) return "";
  return ALIAS_TO_KEY.get(normalized) ?? normalized;
}

/** The canonical Latin spelling; used for sorting and for Latin locales. */
export function canonicalBrandName(brand: string): string {
  const key = brandKey(brand);
  return BRANDS[key]?.en ?? brand.trim();
}

/** Display name for one brand. The stored value is never changed. */
export function brandLabel(brand: string, locale: string): string {
  const key = brandKey(brand);
  const entry = BRANDS[key];
  if (!entry) return brand.trim();
  if (locale === "zh") return entry.zh ?? entry.en;
  return entry.en;
}

/** "Doosan / Daewoo" reads as "斗山 / 大宇" on a Chinese page, without duplicates. */
export function brandListLabel(brands: string[], locale: string): string {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const brand of brands) {
    const key = brandKey(brand);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    labels.push(brandLabel(brand, locale));
  }
  return labels.join(" / ");
}
