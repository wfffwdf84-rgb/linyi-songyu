import { normalizeInquiryType, type InquiryTypeId } from "@/lib/inquiry";

/**
 * Wording for the eight stock inquiry types, copied from messages/zh.json so
 * the operations panel - which renders outside the 13-locale site - can label
 * a lead without loading the site's translation runtime.
 */
const TYPE_LABELS_ZH: Record<InquiryTypeId, string> = {
  transmission: "传动系统",
  structural: "结构件",
  brake: "制动件",
  radiator: "散热器",
  hydraulic: "液压",
  oemMatch: "零件号匹配",
  consol: "拼柜发运",
  land: "陆运",
};

export function inquiryTypeLabelZh(id: string) {
  return TYPE_LABELS_ZH[normalizeInquiryType(id)];
}

/** `["brake", "brake", "radiator"]` -> `制动件、散热器`. */
export function inquiryTypesLabelZh(ids: readonly string[]) {
  if (ids.length === 0) return "";
  return [...new Set(ids.map((id) => inquiryTypeLabelZh(id)))].join("、");
}

/**
 * UTC wall clock, e.g. `2026-11-15 08:00 UTC`. Leads arrive from every market
 * at once, so the panel never guesses a local zone.
 */
export function inquiryTimeLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const stamp = date.toISOString();
  return `${stamp.slice(0, 10)} ${stamp.slice(11, 16)} UTC`;
}

/** `2026-11` -> `2026年11月`. */
export function monthLabelZh(month: string) {
  const [year, value] = month.split("-");
  return `${year}年${Number(value)}月`;
}
