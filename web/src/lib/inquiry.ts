export const inquiryTypeIds = [
  "transmission",
  "structural",
  "brake",
  "radiator",
  "hydraulic",
  "oemMatch",
  "consol",
  "land",
] as const;

export type InquiryTypeId = (typeof inquiryTypeIds)[number];

/**
 * Loose but effective: one @, no whitespace, and a dot in the domain. The
 * server and both inquiry forms share this check, so the browser and the API
 * never disagree about what an acceptable address looks like. Email is
 * optional, so callers only run this on a non-empty value.
 */
export const INQUIRY_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const INQUIRY_EMAIL_MAX = 120;

export function isValidInquiryEmail(value: string) {
  const email = value.trim();
  return email.length > 0 && email.length <= INQUIRY_EMAIL_MAX && INQUIRY_EMAIL_PATTERN.test(email);
}

const inquiryTypeAliases: Record<string, InquiryTypeId> = {
  mainDrive: "transmission",
  planetCarrier: "transmission",
  gearRing: "transmission",
  supportShaft: "transmission",
  axleHousing: "transmission",
  halfShaft: "transmission",
  vrtSeries: "transmission",
  gearboxAssy: "transmission",
  gearboxHousing: "transmission",
  torqueHousing: "transmission",
  gearAssy: "transmission",
  gearboxGear: "transmission",
  gearboxShaft: "transmission",
  gearboxFlange: "transmission",
  carrierHousing: "transmission",
  planetGear: "transmission",
  sunGear: "transmission",
  differential: "transmission",
  swingFrame: "structural",
  linkArm: "structural",
  pinSleeve: "structural",
  repairKit: "structural",
  brakeCaliper: "brake",
};

const categoryType: Record<string, InquiryTypeId> = {
  "transmission-systems": "transmission",
  "structural-components": "structural",
  "brake-components": "brake",
  "cooling-parts": "radiator",
  "chinese-brand-parts": "oemMatch",
  "hydraulic-tools": "hydraulic",
};

export function normalizeInquiryType(id?: string): InquiryTypeId {
  if (!id) return "transmission";
  const mapped = inquiryTypeAliases[id] ?? id;
  return (inquiryTypeIds as readonly string[]).includes(mapped)
    ? (mapped as InquiryTypeId)
    : "transmission";
}

export function inquiryTypeFromProduct(categorySlug: string, _slug?: string): InquiryTypeId {
  return categoryType[categorySlug] ?? "transmission";
}

export function parseInquiryTypes(raw?: string | string[]): InquiryTypeId[] {
  const value = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => normalizeInquiryType(item)),
    ),
  ];
}
