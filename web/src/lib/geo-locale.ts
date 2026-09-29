import { defaultLocale, type AppLocale } from "@/lib/locales";

const ZH = new Set(["CN", "TW", "HK", "MO"]);
const AR = new Set([
  "SA", "AE", "QA", "KW", "BH", "OM", "IQ", "JO", "LB", "SY", "YE", "PS",
  "EG", "SD", "LY", "TN", "DZ", "MA", "MR", "SO", "DJ", "KM",
]);
const FR = new Set([
  "FR", "BE", "LU", "MC", "SN", "CI", "CM", "CD", "CG", "GA", "GN", "ML",
  "BF", "NE", "TG", "BJ", "TD", "CF", "MG", "HT", "RW", "BI",
]);
const TH = new Set(["TH"]);
const ID = new Set(["ID"]);
const VI = new Set(["VN"]);
const MS = new Set(["MY", "BN"]);
const PT = new Set(["PT", "AO", "MZ", "GW", "CV", "ST", "TL"]);
const RU = new Set(["RU", "BY", "KZ", "KG"]);
const KO = new Set(["KR"]);
const JA = new Set(["JP"]);
const ES = new Set([
  "ES", "MX", "AR", "CO", "CL", "PE", "VE", "EC", "GT", "CU", "BO", "DO",
  "HN", "PY", "SV", "NI", "CR", "PA", "UY", "PR", "GQ",
]);

export function localeFromCountry(country: string | null | undefined): AppLocale {
  if (!country) return defaultLocale;
  const code = country.toUpperCase();
  if (ZH.has(code)) return "zh";
  if (AR.has(code)) return "ar";
  if (FR.has(code)) return "fr";
  if (TH.has(code)) return "th";
  if (ID.has(code)) return "id";
  if (VI.has(code)) return "vi";
  if (MS.has(code)) return "ms";
  if (PT.has(code)) return "pt";
  if (RU.has(code)) return "ru";
  if (KO.has(code)) return "ko";
  if (JA.has(code)) return "ja";
  if (ES.has(code)) return "es";
  return defaultLocale;
}

export function readCountryCode(headers: Headers) {
  return headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry");
}
