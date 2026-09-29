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
