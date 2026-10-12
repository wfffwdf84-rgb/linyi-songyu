/**
 * ISO country a dialled number belongs to, for the sales desk to see where a
 * lead really is. The phone is often a better signal than the visitor's IP,
 * which a VPN or mobile roaming can move to another country.
 *
 * Covers the markets this catalogue serves plus the major ones beyond. An
 * unknown prefix returns "" rather than a guess.
 */
const CALLING_CODES: Record<string, string> = {
  // North America and the Caribbean (all share +1)
  "1": "US",
  // Europe
  "30": "GR", "31": "NL", "32": "BE", "33": "FR", "34": "ES", "36": "HU",
  "39": "IT", "40": "RO", "41": "CH", "43": "AT", "44": "GB", "45": "DK",
  "46": "SE", "47": "NO", "48": "PL", "49": "DE", "350": "GI", "351": "PT",
  "352": "LU", "353": "IE", "354": "IS", "355": "AL", "356": "MT", "357": "CY",
  "358": "FI", "359": "BG", "370": "LT", "371": "LV", "372": "EE", "373": "MD",
  "374": "AM", "375": "BY", "376": "AD", "377": "MC", "380": "UA", "381": "RS",
  "382": "ME", "385": "HR", "386": "SI", "387": "BA", "389": "MK",
  "420": "CZ", "421": "SK",
  // Russia and Central Asia
  "7": "RU", "992": "TJ", "993": "TM", "994": "AZ", "995": "GE", "996": "KG", "998": "UZ",
  // Middle East
  "90": "TR", "961": "LB", "962": "JO", "963": "SY", "964": "IQ", "965": "KW",
  "966": "SA", "967": "YE", "968": "OM", "970": "PS", "971": "AE", "972": "IL",
  "973": "BH", "974": "QA",
  // South and Central Asia
  "91": "IN", "92": "PK", "93": "AF", "94": "LK", "95": "MM", "98": "IR",
  "960": "MV", "975": "BT", "976": "MN", "977": "NP",
  // East and Southeast Asia
  "81": "JP", "82": "KR", "84": "VN", "86": "CN", "852": "HK", "853": "MO",
  "886": "TW", "60": "MY", "62": "ID", "63": "PH", "65": "SG", "66": "TH",
  "673": "BN", "855": "KH", "856": "LA",
  // Africa
  "20": "EG", "27": "ZA", "212": "MA", "213": "DZ", "216": "TN", "218": "LY",
  "220": "GM", "221": "SN", "222": "MR", "223": "ML", "224": "GN", "225": "CI",
  "226": "BF", "227": "NE", "228": "TG", "229": "BJ", "230": "MU", "231": "LR",
  "232": "SL", "233": "GH", "234": "NG", "235": "TD", "236": "CF", "237": "CM",
  "238": "CV", "240": "GQ", "241": "GA", "242": "CG", "243": "CD", "244": "AO",
  "245": "GW", "248": "SC", "249": "SD", "250": "RW", "251": "ET", "252": "SO",
  "253": "DJ", "254": "KE", "255": "TZ", "256": "UG", "257": "BI", "258": "MZ",
  "260": "ZM", "261": "MG", "263": "ZW", "264": "NA", "265": "MW", "266": "LS",
  "267": "BW", "268": "SZ", "269": "KM",
  // Oceania
  "61": "AU", "64": "NZ", "675": "PG", "676": "TO", "677": "SB", "678": "VU", "679": "FJ",
  // Latin America
  "51": "PE", "52": "MX", "54": "AR", "55": "BR", "56": "CL", "57": "CO", "58": "VE",
  "501": "BZ", "502": "GT", "503": "SV", "504": "HN", "505": "NI", "506": "CR",
  "507": "PA", "509": "HT", "591": "BO", "592": "GY", "593": "EC", "595": "PY",
  "597": "SR", "598": "UY",
};

function lookup(digits: string) {
  for (const length of [3, 2, 1]) {
    const candidate = digits.slice(0, length);
    if (CALLING_CODES[candidate]) return CALLING_CODES[candidate];
  }
  return "";
}

/**
 * ISO country of the contact, or "" when it is not a dialable number (an email
 * address, say) or the prefix is unknown.
 */
export function phoneCountry(contact: string): string {
  const cleaned = contact.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return lookup(cleaned.slice(1));
  if (cleaned.startsWith("00")) return lookup(cleaned.slice(2));
  return "";
}
