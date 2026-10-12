import { readCountryCode } from "@/lib/geo-locale";

export type VisitorGeo = {
  country: string;
  city: string;
  timezone: string;
};

/**
 * Country, city and time zone Vercel derives from the visitor's IP. Accurate at
 * country level; a VPN or mobile roaming can point it at the wrong place, which
 * is why the desk shows the phone's country beside it.
 */
export function readVisitorGeo(headers: Headers): VisitorGeo {
  const city = headers.get("x-vercel-ip-city") ?? "";
  let decodedCity = city;
  try {
    decodedCity = decodeURIComponent(city);
  } catch {
    // keep the raw value when it is not percent-encoded
  }
  return {
    country: (readCountryCode(headers) ?? "").toUpperCase().slice(0, 2),
    city: decodedCity.slice(0, 60),
    timezone: (headers.get("x-vercel-ip-timezone") ?? "").slice(0, 60),
  };
}

/** Localised country name from its ISO code, without shipping a name table. */
export function countryLabel(code: string, locale: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "";
  try {
    const names = new Intl.DisplayNames([locale === "zh" ? "zh-CN" : "en"], { type: "region" });
    return names.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Flag emoji from the ISO code's regional indicator letters. */
export function countryFlag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65));
}

/** Wall-clock time at the visitor's location when the lead was sent. */
export function localTime(iso: string, timezone: string): string {
  if (!timezone) return "";
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return "";
  }
}
