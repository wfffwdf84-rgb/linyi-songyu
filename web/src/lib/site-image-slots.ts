/**
 * The site images an operator may replace, and the rules for their document.
 *
 * This module is the half that validates and merges, exactly like
 * `copy-rules.ts` and `announcement-rules.ts`: no imports, no storage, no
 * `next/*`. `src/lib/site-images.ts` adds the Supabase read/write on top, and the
 * admin panel receives slot descriptors and current values as props, so a client
 * component never reaches for this file's server half.
 *
 * Only non-product images live here. Product photos belong to the product record
 * (`src/lib/data/products.ts` and the admin product editor) and are deliberately
 * untouched: changing a catalogue photo is a product edit, not a site decoration.
 *
 * The stored document is sparse, like the copy overlay: a slot is absent when it
 * shows its shipped file. That is what makes "恢复默认" a delete instead of a
 * copy, and it keeps the file small as operators replace and revert images.
 */

export type SiteImageSlotKind = "single" | "carousel";

export type SiteImageGroup = {
  id: string;
  label: string;
  /** Front-end page the group is about, for the "view the page" link. */
  pagePath: string;
  hint: string;
};

export type SiteImageSlot = {
  id: string;
  /** Chinese name the operator reads. */
  label: string;
  group: string;
  kind: SiteImageSlotKind;
  /** Shipped files, in display order. Never empty. */
  defaults: readonly string[];
  /** Where this image appears, in Chinese. */
  where: string;
  /** What the slot expects, in Chinese. */
  hint: string;
};

export const SITE_IMAGE_GROUPS: readonly SiteImageGroup[] = [
  {
    id: "home",
    label: "首页",
    pagePath: "/",
    hint: "首页首屏的大图。轮播可以放 1 到 4 张，顺序就是显示顺序。",
  },
  {
    id: "factory",
    label: "工厂实拍（六张）",
    pagePath: "/",
    hint: "首页工厂区、关于页底部和品质与物流页的同一个六宫格，改一张三处一起变。",
  },
  {
    id: "quality",
    label: "品质与物流",
    pagePath: "/quality-logistics",
    hint: "品质页首屏大图与「临沂物流枢纽」区块配图。",
  },
  {
    id: "brand",
    label: "全站品牌",
    pagePath: "/",
    hint: "页头、页脚与关于页的 logo；浏览器标签图标与结构化数据仍用站内原文件。",
  },
];

export const SITE_IMAGE_SLOTS: readonly SiteImageSlot[] = [
  {
    id: "home.hero",
    label: "首页首屏轮播图",
    group: "home",
    kind: "carousel",
    defaults: [
      "/images/hero-warehouse-parts.webp",
      "/images/hero-radiator-field.webp",
      "/images/hero-transmission-assembly.webp",
      "/images/hero-cast-housing.webp",
    ],
    where: "首页最上方整屏背景（标题叠在图片上），桌面端每 3 秒自动切换",
    hint: "建议横图、至少 1920px 宽。数量少于 2 张时不再轮播，也不显示左右箭头。",
  },
  {
    id: "factory.exterior",
    label: "工厂图 1 · 厂区一角",
    group: "factory",
    kind: "single",
    defaults: ["/images/factory/factory-exterior.webp"],
    where: "首页 / 关于页 / 品质页的工厂六宫格第 1 张",
    hint: "横图 16:9 效果最好，图注文字在「文案」里改。",
  },
  {
    id: "factory.heatTreatment",
    label: "工厂图 2 · 先进热处理设备",
    group: "factory",
    kind: "single",
    defaults: ["/images/factory/heat-treatment.webp"],
    where: "首页 / 关于页 / 品质页的工厂六宫格第 2 张",
    hint: "横图 16:9 效果最好。",
  },
  {
    id: "factory.envEquipment",
    label: "工厂图 3 · 环保处理设备",
    group: "factory",
    kind: "single",
    defaults: ["/images/factory/env-equipment.webp"],
    where: "首页 / 关于页 / 品质页的工厂六宫格第 3 张",
    hint: "横图 16:9 效果最好。",
  },
  {
    id: "factory.productionLine",
    label: "工厂图 4 · 流水线生产",
    group: "factory",
    kind: "single",
    defaults: ["/images/factory/production-line.webp"],
    where: "首页 / 关于页 / 品质页的工厂六宫格第 4 张",
    hint: "横图 16:9 效果最好。",
  },
  {
    id: "factory.cmmInspection",
    label: "工厂图 5 · 三坐标检测",
    group: "factory",
    kind: "single",
    defaults: ["/images/factory/cmm-inspection.webp"],
    where: "首页 / 关于页 / 品质页的工厂六宫格第 5 张",
    hint: "横图 16:9 效果最好。",
  },
  {
    id: "factory.workshop",
    label: "工厂图 6 · 车间一角",
    group: "factory",
    kind: "single",
    defaults: ["/images/factory/workshop.webp"],
    where: "首页 / 关于页 / 品质页的工厂六宫格第 6 张",
    hint: "横图 16:9 效果最好。",
  },
  {
    id: "quality.inspectionPhoto",
    label: "品质页首屏检测大图",
    group: "quality",
    kind: "single",
    defaults: ["/images/factory/cmm-inspection.webp"],
    where: "品质与物流页首屏右侧的大图（下面有一行图注）",
    hint: "横图 16:9。",
  },
  {
    id: "quality.hubPhoto",
    label: "品质页物流枢纽配图",
    group: "quality",
    kind: "single",
    defaults: ["/images/factory/factory-exterior.webp"],
    where: "品质与物流页「临沂物流枢纽：快速发运」区块左侧配图",
    hint: "横图 16:9。",
  },
  {
    id: "site.logo",
    label: "站点 logo",
    group: "brand",
    kind: "single",
    defaults: ["/images/brand/logo.png"],
    where: "页头左上角、页脚、关于页顶部；手机页头也用它",
    hint: "正方形、透明背景的 PNG 效果最好。浏览器标签图标与社交分享图不会跟着变。",
  },
];

/** A carousel slot is capped so the panel and the page stay readable. */
export const SITE_IMAGE_ITEMS_MAX = 8;

/** One URL: long enough for a Supabase public URL, short enough to reject junk. */
export const SITE_IMAGE_VALUE_MAX = 600;

/** Stored shape: one key per slot, a string for single slots, an array for carousels. */
export type SiteImageOverrides = Record<string, string | string[]>;

/** Effective values: defaults filled in for every slot without an override. */
export type SiteImageMap = Record<string, string | string[]>;

export type SiteImageDocument = {
  version: 1;
  updatedAt: string;
  images: SiteImageOverrides;
};

export class SiteImageError extends Error {
  constructor(
    readonly code: string,
    readonly detail = "",
  ) {
    super(detail ? `${code}: ${detail}` : code);
    this.name = "SiteImageError";
  }
}

/** HTTP status per error code, shared by the two admin routes. */
export const SITE_IMAGE_ERROR_STATUS: Record<string, number> = {
  invalid_body: 400,
  invalid_slot: 400,
  invalid_value: 400,
  too_many: 400,
  no_file: 400,
  too_large: 413,
  unsupported_type: 415,
  upload_failed: 500,
  not_configured: 503,
  unavailable: 503,
};

/** Slots by id, for a route that receives one. */
const SLOT_INDEX = new Map(SITE_IMAGE_SLOTS.map((slot) => [slot.id, slot]));

export function findSiteImageSlot(id: unknown): SiteImageSlot | undefined {
  return typeof id === "string" ? SLOT_INDEX.get(id) : undefined;
}

export function siteImageGroup(id: string): SiteImageGroup | undefined {
  return SITE_IMAGE_GROUPS.find((group) => group.id === id);
}

/** The shipped files of a slot, always as an array. */
export function siteImageDefaults(slot: SiteImageSlot): string[] {
  return [...slot.defaults];
}

/**
 * True for a value this site may render: a `/images/...` path of our own, or an
 * https URL (the upload route only ever hands out Supabase public URLs).
 *
 * `javascript:` and `data:` URLs never match, `..` is refused so a stored path
 * cannot walk out of `/images`, and angle brackets are refused because the value
 * ends up in an img tag.
 */
export function isSiteImageSource(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > SITE_IMAGE_VALUE_MAX) return false;
  if (trimmed.includes("..") || trimmed.includes("\\")) return false;
  if (/[<>"'`\s]/.test(trimmed)) return false;
  if (trimmed.startsWith("/images/")) {
    return /^\/images\/[A-Za-z0-9._/-]+$/.test(trimmed);
  }
  return /^https:\/\/[A-Za-z0-9.-]+(?::\d+)?\/[^\s]*$/.test(trimmed);
}

function sameList(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

/**
 * A request value in the shape the slot stores, or null for "restore the shipped
 * image". Throws `invalid_value` / `too_many` for anything that must be refused.
 */
export function normalizeSiteImageValue(
  slot: SiteImageSlot,
  value: unknown,
): string | string[] | null {
  if (slot.kind === "single") {
    if (value === null || value === undefined || value === "") return null;
    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      if (value.length > 1) throw new SiteImageError("too_many", slot.id);
      if (!isSiteImageSource(value[0])) throw new SiteImageError("invalid_value", slot.id);
      return value[0].trim();
    }
    if (!isSiteImageSource(value)) throw new SiteImageError("invalid_value", slot.id);
    return value.trim();
  }

  if (value === null || value === undefined || value === "") return null;
  const list = Array.isArray(value) ? value : [value];
  if (list.length === 0) return null;
  if (list.length > SITE_IMAGE_ITEMS_MAX) throw new SiteImageError("too_many", slot.id);
  const cleaned: string[] = [];
  for (const item of list) {
    if (!isSiteImageSource(item)) throw new SiteImageError("invalid_value", slot.id);
    const url = item.trim();
    // The same photo twice in one carousel is an editing mistake, not a feature.
    if (cleaned.includes(url)) continue;
    cleaned.push(url);
  }
  return cleaned;
}

/**
 * The document body back to overrides, tolerantly: a corrupt row, an unknown
 * slot, a value of the wrong shape or a value equal to the shipped image are all
 * dropped. An unreadable decoration document must never take the site down.
 */
export function parseSiteImageDocument(body: string): SiteImageOverrides {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null) return {};
  const raw = (parsed as Record<string, unknown>).images;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};

  const overrides: SiteImageOverrides = {};
  for (const [slotId, value] of Object.entries(raw as Record<string, unknown>)) {
    const slot = SLOT_INDEX.get(slotId);
    if (!slot) continue;
    let normalized: string | string[] | null = null;
    try {
      normalized = normalizeSiteImageValue(slot, value);
    } catch {
      normalized = null;
    }
    if (normalized === null) continue;
    // A stored value identical to the shipped files is not an override.
    const asList = Array.isArray(normalized) ? normalized : [normalized];
    if (sameList(asList, siteImageDefaults(slot))) continue;
    overrides[slotId] = normalized;
  }
  return overrides;
}

/** Defaults with the stored overrides layered on; one entry per slot, always. */
export function effectiveSiteImages(overrides: SiteImageOverrides): SiteImageMap {
  const images: SiteImageMap = {};
  for (const slot of SITE_IMAGE_SLOTS) {
    const override = overrides[slot.id];
    if (override === undefined) {
      images[slot.id] = slot.kind === "single" ? slot.defaults[0] : siteImageDefaults(slot);
      continue;
    }
    images[slot.id] = override;
  }
  return images;
}

/** One slot's effective value as an array, whatever the slot kind. */
export function siteImageListFrom(images: SiteImageMap, slotId: string): string[] {
  const value = images[slotId];
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value) return [value];
  const slot = SLOT_INDEX.get(slotId);
  return slot ? siteImageDefaults(slot) : [];
}

/** One slot's first effective image; the helper every component uses. */
export function siteImageFrom(images: SiteImageMap, slotId: string): string {
  return siteImageListFrom(images, slotId)[0] ?? "";
}

export function siteImageOverridden(overrides: SiteImageOverrides, slotId: string) {
  return Object.prototype.hasOwnProperty.call(overrides, slotId);
}

/**
 * The overrides after writing one slot.
 *
 * A null value (or a value equal to the shipped files, or an empty carousel)
 * deletes the entry, which is exactly what "恢复默认" means. The input map is not
 * mutated, so a failed write leaves the caller's copy intact.
 */
export function planSiteImageWrite(
  overrides: SiteImageOverrides,
  slotId: unknown,
  value: unknown,
): SiteImageOverrides {
  const slot = findSiteImageSlot(slotId);
  if (!slot) throw new SiteImageError("invalid_slot", String(slotId ?? ""));

  const normalized = normalizeSiteImageValue(slot, value);
  const next: SiteImageOverrides = { ...overrides };
  if (normalized === null) {
    delete next[slot.id];
    return next;
  }
  const asList = Array.isArray(normalized) ? normalized : [normalized];
  if (sameList(asList, siteImageDefaults(slot))) {
    delete next[slot.id];
    return next;
  }
  next[slot.id] = normalized;
  return next;
}
