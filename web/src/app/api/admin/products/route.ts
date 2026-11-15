import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession, requireRole, type AdminSession } from "@/lib/admin-auth";
import { getAdminProducts, getSeedProduct } from "@/lib/catalog";
import { appLocales, localePath } from "@/lib/locales";
import {
  PRODUCT_OVERRIDES_TAG,
  ProductStoreError,
  applyOverride,
  buildOverride,
  sanitizePatch,
  saveOverride,
} from "@/lib/product-store";

/** Codes the client maps to Chinese copy; anything else becomes a 500. */
const STATUS: Record<string, number> = {
  invalid_patch: 400,
  invalid_name: 400,
  invalid_description: 400,
  invalid_price: 400,
  invalid_specs: 400,
  invalid_slug: 400,
  not_found: 404,
  not_configured: 503,
  unavailable: 503,
};

function failure(error: unknown) {
  if (error instanceof ProductStoreError) {
    return NextResponse.json(
      { ok: false, error: error.code },
      { status: STATUS[error.code] ?? 400 },
    );
  }
  console.error("admin products request failed", error);
  return NextResponse.json({ ok: false, error: "unavailable" }, { status: 500 });
}

/**
 * Sales may read enquiries, never the catalogue editor. The navigation hiding
 * the section is convenience; this guard is the access control.
 */
async function editorOnly(): Promise<
  { session: AdminSession; response: null } | { session: null; response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }),
    };
  }
  if (!requireRole(session, ["owner", "editor"])) {
    return {
      session: null,
      response: NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 }),
    };
  }
  return { session, response: null };
}

export async function GET(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const query = (new URL(request.url).searchParams.get("q") ?? "").trim().toLowerCase();
  const all = await getAdminProducts();
  const hits = query
    ? all.filter((product) =>
        [product.partNumber, product.slug, product.name.en, product.name.zh]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : all;

  return NextResponse.json(
    {
      ok: true,
      total: hits.length,
      products: hits.map((product) => ({
        slug: product.slug,
        partNumber: product.partNumber,
        categorySlug: product.categorySlug,
        name: product.name,
        description: product.description,
        specs: product.specs,
        inStock: product.inStock,
        hidden: product.hidden,
        overridden: product.overridden,
        // Price is part of this response on purpose: it is the internal view.
        price: product.price ?? null,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Saves one product's overlay. The stored document keeps only the fields that
 * differ from the seed, so reverting every field deletes the override and the
 * product returns to "未修改".
 */
export async function PATCH(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  if (!slug) return NextResponse.json({ ok: false, error: "invalid_slug" }, { status: 400 });

  const seed = getSeedProduct(slug);
  if (!seed) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  try {
    const patch = sanitizePatch(body?.patch);
    // Diffed against the seed, never against the merged product: a full revert
    // has to empty the override instead of pinning today's values in place.
    const override = buildOverride(seed, patch);
    await saveOverride(slug, override);
    revalidateProduct(slug, seed.categorySlug);
    // The response is built from the override that was just written, not from a
    // second read: revalidateTag() only lands on the shared cache after this
    // request finishes, so a fresh read here could still return the old entry.
    const merged = applyOverride(seed, override);
    return NextResponse.json(
      {
        ok: true,
        overridden: Object.keys(override).length > 0,
        product: {
          slug: merged.slug,
          name: merged.name,
          description: merged.description,
          specs: merged.specs,
          inStock: merged.inStock,
          hidden: override.hidden === true,
          overridden: Object.keys(override).length > 0,
          price: merged.price ?? null,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}

/**
 * Regenerates every cached page a product edit can change: its own page, its
 * category, the parts index, the home page strip and the sitemap - in all 13
 * languages, since the copy is rendered per locale.
 */
function revalidateProduct(slug: string, categorySlug: string) {
  const paths = [`/parts/${categorySlug}/${slug}`, `/parts/${categorySlug}`, "/parts", "/"];
  for (const locale of appLocales) {
    for (const path of paths) revalidatePath(localePath(locale, path));
  }
  revalidatePath("/sitemap.xml");
  // The overlay document itself is one cached entry shared by every page above,
  // so it has to expire too instead of only the per-path entries.
  revalidateTag(PRODUCT_OVERRIDES_TAG, { expire: 0 });
}
