import { NextResponse } from "next/server";
import { editorOnly } from "@/lib/admin-guard";
import { readChineseCopy, readCopyGroupKeys, resolveTranslateKeys } from "@/lib/copy";
import { COPY_ERROR_STATUS, CopyError, COPY_VALUE_MAX, findCopyGroup } from "@/lib/copy-rules";
import { localeHtmlLang, isAppLocale } from "@/lib/locales";
import { translateTo } from "@/lib/translate";

/**
 * "Translate this group from the Chinese copy" for the copy editor.
 *
 * Nothing is written: the endpoint returns text the browser drops into the input
 * boxes, and the operator confirms it by pressing 保存. That is deliberate - a
 * machine translation is a draft, and the site must never show one that a human
 * has not read.
 *
 * Translation runs item by item against the same free endpoint the inquiry desk
 * uses. Failures are collected per key and returned instead of failing the whole
 * request, so a partial result is honest about which entries are missing. A fully
 * failed run returns 502 with `translate_failed`.
 */

export const dynamic = "force-dynamic";

/** Translate a handful at a time: the keyless endpoint rate-limits bursts. */
const CONCURRENCY = 4;

/** Vercel's default is short; a whole quote group is ~118 strings. */
export const maxDuration = 60;

function failure(error: unknown) {
  if (error instanceof CopyError) {
    return NextResponse.json(
      { ok: false, error: error.code, detail: error.detail },
      { status: COPY_ERROR_STATUS[error.code] ?? 400 },
    );
  }
  console.error("admin copy translate failed", error);
  return NextResponse.json({ ok: false, error: "unavailable" }, { status: 500 });
}

export async function POST(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return failure(new CopyError("invalid_body"));

  try {
    const groupId = typeof body.group === "string" ? body.group.trim() : "";
    const group = findCopyGroup(groupId);
    if (!group) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    // The Chinese copy is the source: shipped text with the saved zh overrides on
    // top. Keys come from the group unless the caller names them explicitly, and
    // every one of them is re-checked against the namespace whitelist.
    const groupKeys = await readCopyGroupKeys(group.id);
    const { locale, keys } = resolveTranslateKeys(body, groupKeys);
    const source = await readChineseCopy(keys);
    if (!isAppLocale(locale)) throw new CopyError("invalid_locale", locale);
    const target = localeHtmlLang[locale];

    const translations: Record<string, string> = {};
    const failed: string[] = [];
    const oversized: string[] = [];
    const pending = Object.entries(source);

    let cursor = 0;
    const worker = async () => {
      for (;;) {
        const index = cursor;
        cursor += 1;
        if (index >= pending.length) return;
        const [key, text] = pending[index];
        const translated = await translateTo(text, target, "zh");
        if (!translated) {
          failed.push(key);
          continue;
        }
        if (translated.length > COPY_VALUE_MAX) oversized.push(key);
        translations[key] = translated.slice(0, COPY_VALUE_MAX);
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, pending.length) }, () => worker()),
    );

    if (Object.keys(translations).length === 0) throw new CopyError("translate_failed");

    return NextResponse.json(
      {
        ok: true,
        locale,
        group: group.id,
        translations,
        // Keys with no Chinese text to translate (missing from the zh bundle).
        skipped: keys.filter((key) => !(key in source)),
        failed,
        oversized,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
