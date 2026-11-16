import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { editorOnly } from "@/lib/admin-guard";
import {
  COPY_OVERRIDES_TAG,
  readCopyGroupRows,
  readCopyOverridesReport,
  saveCopyLocale,
} from "@/lib/copy";
import { COPY_ERROR_STATUS, CopyError, findCopyGroup } from "@/lib/copy-rules";
import { isAppLocale } from "@/lib/locales";

/**
 * The copy overlay: read one group, save one locale.
 *
 * Owners and editors only - the same guard the product editor uses, because this
 * is public site copy. `sales` is refused with 403 by `editorOnly` before the
 * body is even parsed.
 *
 * The namespace whitelist is enforced inside `parseCopyPatch` (called by
 * `saveCopyLocale`) and again for every stored entry by `parseCopyDocument`, so a
 * request that names `terms.title` is rejected server side no matter what the
 * form sent. The panel hiding those namespaces is a convenience, not the gate.
 *
 * Every successful write expires the cached overlay tag and revalidates the whole
 * layout: `messages` are resolved in the locale layout, so every prerendered page
 * carries a copy of them and only a layout-wide revalidation expires them all.
 */

export const dynamic = "force-dynamic";

function failure(error: unknown) {
  if (error instanceof CopyError) {
    return NextResponse.json(
      { ok: false, error: error.code, detail: error.detail },
      { status: COPY_ERROR_STATUS[error.code] ?? 400 },
    );
  }
  console.error("admin copy request failed", error);
  return NextResponse.json({ ok: false, error: "unavailable" }, { status: 500 });
}

function noStore<T>(body: T) {
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}

/**
 * `?locale=zh&group=home` -> the rows of that group: key, shipped copy, current
 * value. The panel renders straight from the same functions, so this is the
 * programmatic view of exactly what the editor shows.
 */
export async function GET(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const query = new URL(request.url).searchParams;
  const locale = (query.get("locale") ?? "zh").trim();
  const group = (query.get("group") ?? "home").trim();

  if (!isAppLocale(locale)) {
    return NextResponse.json({ ok: false, error: "invalid_locale" }, { status: 400 });
  }
  const found = findCopyGroup(group);
  if (!found) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const [rows, { status }] = await Promise.all([
    readCopyGroupRows(locale, found.id),
    readCopyOverridesReport(),
  ]);
  return noStore({
    ok: true,
    locale,
    group: found.id,
    label: found.label,
    status,
    rows: rows ?? [],
  });
}

/** `{ locale, entries }` -> one locale's overrides, pruned against the shipped copy. */
export async function PATCH(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const body = await request.json().catch(() => null);

  try {
    const result = await saveCopyLocale(body);
    if (result.written) {
      revalidateTag(COPY_OVERRIDES_TAG, { expire: 0 });
      revalidatePath("/", "layout");
    }
    return noStore({ ok: true, ...result });
  } catch (error) {
    return failure(error);
  }
}
