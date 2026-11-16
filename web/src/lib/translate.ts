/**
 * Translation for the admin panel.
 *
 * Two callers share this module: the inquiry desk renders a Chinese rendering of
 * a free-text lead (`toChinese`), and the copy editor fills its inputs with a
 * translation of the Chinese site copy (`translateTo`). Both go through the same
 * keyless Google endpoint by default, which needs no account; set
 * TRANSLATE_API_KEY to switch to the official Cloud Translation API.
 *
 * Nothing here writes to storage. A failed translation returns "" and the caller
 * decides what to say - the copy editor reports the keys that did not come back
 * instead of saving anything.
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

async function viaGoogleCloud(text: string, key: string, target: string) {
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: text, target, format: "text" }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (!response.ok) return "";
  const data = (await response.json()) as {
    data?: { translations?: { translatedText?: string }[] };
  };
  return data.data?.translations?.[0]?.translatedText?.trim() ?? "";
}

/**
 * The keyless `translate_a/single` endpoint. `source` stays `auto` for the
 * inquiry desk, which receives any language; the copy editor names `zh` because
 * it always translates the Chinese copy.
 */
async function viaKeylessEndpoint(text: string, target: string, source: string) {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(source)}` +
    `&tl=${encodeURIComponent(target)}&dt=t&q=` +
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

/**
 * Translates one string into `target` (a BCP-47 tag, e.g. `en`, `pt`, `zh-CN`).
 *
 * Returns "" when the endpoint is unavailable or answers with something that is
 * not a translation. It never throws: the caller aggregates the empty results and
 * reports them, which is what keeps a partial failure from looking like success.
 */
export async function translateTo(
  text: string,
  target: string,
  source = "auto",
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || !target) return "";
  const input = trimmed.slice(0, MAX_CHARS);
  const key = process.env.TRANSLATE_API_KEY?.trim();
  try {
    return key ? await viaGoogleCloud(input, key, target) : await viaKeylessEndpoint(input, target, source);
  } catch {
    // A failed translation is reported by the caller; nothing is written.
    return "";
  }
}

/** Returns the Chinese text, or "" when it is not needed or unavailable. */
export async function toChinese(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!needsTranslation(trimmed)) return "";
  return translateTo(trimmed.slice(0, MAX_CHARS), "zh-CN", "auto");
}
