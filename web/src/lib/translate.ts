/**
 * Chinese rendering of a free-text inquiry, shown under the untouched original
 * so the sales desk can read a foreign-language lead.
 *
 * The default backend is Google's keyless endpoint, which needs no account and
 * handles a handful of leads a day comfortably. Set TRANSLATE_API_KEY to switch
 * to the official Cloud Translation API.
 */
const CJK = /[\u3400-\u4dbf\u4e00-\u9fff]/g;
const MAX_CHARS = 1500;
const TIMEOUT_MS = 6000;

/** Nothing to do when the text is already Chinese, or too short to matter. */
function needsTranslation(text: string) {
  const bare = text.replace(/\s/g, "");
  if (bare.length < 3) return false;
  const cjk = (bare.match(CJK) ?? []).length;
  return cjk / bare.length < 0.15;
}

async function viaGoogleCloud(text: string, key: string) {
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: text, target: "zh-CN", format: "text" }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (!response.ok) return "";
  const data = (await response.json()) as {
    data?: { translations?: { translatedText?: string }[] };
  };
  return data.data?.translations?.[0]?.translatedText?.trim() ?? "";
}

async function viaKeylessEndpoint(text: string) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=" +
    encodeURIComponent(text);
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) return "";
  const data = (await response.json()) as unknown;
  if (!Array.isArray(data) || !Array.isArray(data[0])) return "";
  return (data[0] as unknown[][])
    .map((chunk) => (Array.isArray(chunk) && typeof chunk[0] === "string" ? chunk[0] : ""))
    .join("")
    .trim();
}

/** Returns the Chinese text, or "" when it is not needed or unavailable. */
export async function toChinese(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!needsTranslation(trimmed)) return "";
  const input = trimmed.slice(0, MAX_CHARS);
  const key = process.env.TRANSLATE_API_KEY?.trim();
  try {
    return key ? await viaGoogleCloud(input, key) : await viaKeylessEndpoint(input);
  } catch {
    // a failed translation just leaves the original on its own
    return "";
  }
}
