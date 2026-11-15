import { normalizeInquiryType } from "@/lib/inquiry";
import { phoneCountry } from "@/lib/phone-country";
import type { StoredInquiry } from "@/lib/inquiry-store";

/** One row of a breakdown: the bucket key and how many leads fell in it. */
export type InquiryCount = {
  key: string;
  count: number;
};

export type InquiryStats = {
  total: number;
  /** Leads newer than the desk's read watermark. */
  unread: number;
  /** Leads received in the current UTC month. */
  thisMonth: number;
  byCountry: InquiryCount[];
  byType: InquiryCount[];
  /** Oldest first, so a chart reads left to right. */
  byMonth: InquiryCount[];
};

export const STATS_MONTHS = 6;
export const STATS_COUNTRY_LIMIT = 10;
export const UNKNOWN_COUNTRY = "??";

/** `2026-11-15T08:00:00.000Z` -> `2026-11`. Stored timestamps are always UTC. */
export function inquiryMonthKey(iso: string) {
  return iso.slice(0, 7);
}

/** The last `STATS_MONTHS` month keys, oldest first, ending with `now`'s month. */
export function monthKeys(now: Date, months = STATS_MONTHS) {
  const keys: string[] = [];
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    keys.push(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

/**
 * The visitor's country, falling back to the dialling code when Vercel did not
 * report one: a VPN moves the IP, but the phone usually stays where the lead is.
 */
export function inquiryCountry(inquiry: StoredInquiry) {
  const ipCountry = (inquiry.ipCountry ?? "").toUpperCase();
  if (/^[A-Z]{2}$/.test(ipCountry)) return ipCountry;
  return phoneCountry(inquiry.contact) || UNKNOWN_COUNTRY;
}

function topCounts(counts: Map<string, number>, limit: number): InquiryCount[] {
  return [...counts.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

/**
 * Pure aggregation over the leads `listInquiries()` already decrypted, so the
 * dashboard and its tests share one implementation and no extra reads.
 */
export function computeInquiryStats(
  inquiries: readonly StoredInquiry[],
  readAt: string,
  now: Date = new Date(),
): InquiryStats {
  const months = monthKeys(now);
  const currentMonth = months[months.length - 1];
  const countries = new Map<string, number>();
  const types = new Map<string, number>();
  const perMonth = new Map<string, number>(months.map((month) => [month, 0]));
  let unread = 0;
  let thisMonth = 0;

  for (const inquiry of inquiries) {
    const receivedAt = inquiry.receivedAt ?? "";
    if (!readAt || receivedAt > readAt) unread += 1;

    const month = inquiryMonthKey(receivedAt);
    if (month === currentMonth) thisMonth += 1;
    if (perMonth.has(month)) perMonth.set(month, (perMonth.get(month) ?? 0) + 1);

    const country = inquiryCountry(inquiry);
    countries.set(country, (countries.get(country) ?? 0) + 1);

    // Stored types are already normalised, but an older lead may still carry a
    // category id, so normalise again before counting.
    for (const id of new Set((inquiry.types ?? []).map((type) => normalizeInquiryType(type)))) {
      types.set(id, (types.get(id) ?? 0) + 1);
    }
  }

  return {
    total: inquiries.length,
    unread,
    thisMonth,
    byCountry: topCounts(countries, STATS_COUNTRY_LIMIT),
    byType: topCounts(types, STATS_COUNTRY_LIMIT),
    byMonth: months.map((month) => ({ key: month, count: perMonth.get(month) ?? 0 })),
  };
}
