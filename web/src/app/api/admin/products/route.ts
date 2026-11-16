import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { editorOnly } from "@/lib/admin-guard";
import { getAdminProducts, getBaseProduct, getSeedProduct } from "@/lib/catalog";
import { categories } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { appLocales, localePath } from "@/lib/locales";
import {
  PRODUCT_OVERRIDES_TAG,
  ProductStoreError,
  applyOverride,
  buildOverride,
  clearOverride,
  createNewProduct,
  deleteNewProduct,
  sanitizeNewProduct,
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
  invalid_part_number: 400,
  invalid_brand: 400,
  invalid_category: 400,
  invalid_image: 400,
  invalid_compatible: 400,
  invalid_oem_numbers: 400,
  slug_taken: 409,
  part_number_taken: 409,
  too_many_products: 409,
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
        image: product.image,
        specs: product.specs,
        inStock: product.inStock,
        hidden: product.hidden,
        overridden: product.overridden,
        isNew: product.isNew,
        // Price is part of this response on purpose: it is the internal view.
        price: product.price ?? null,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Creates a product that has no seed entry. The whole catalogue is revalidated
 * afterwards, including the new product's own URL: it is not in the build, so
 * its page only exists because the route segment renders unknown params on
 * demand and this call expires whatever the list pages already cached.
 */
export async function POST(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false, error: "invalid_patch" }, { status: 400 });

  try {
    const seedSlugs = new Set(products.map((product) => product.slug.toLowerCase()));
    const seedPartNumbers = new Set(products.map((product) => product.partNumber.toLowerCase()));
    const draft = sanitizeNewProduct(body, {
      seedSlugs,
      seedPartNumbers,
      categorySlugs: new Set(categories.map((category) => category.slug)),
    });

    const created = await createNewProduct(draft, guard.session.userId);
    // Read the overlay after the write so the response reflects the stored
    // record rather than the request body.
    revalidateProduct(created.slug, created.categorySlug);

    return NextResponse.json(
      {
        ok: true,
        product: {
          slug: created.slug,
          partNumber: created.partNumber,
          categorySlug: created.categorySlug,
          name: created.name,
          description: created.description,
          specs: created.specs,
          image: created.image,
          inStock: created.inStock,
          price: created.price ?? null,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}

/**
 * Saves one product's overlay. The stored document keeps only the fields that
 * differ from the base product, so reverting every field deletes the override
 * and the product returns to "未修改". For a product added in the panel the
 * base is the stored record, which is what "原始内容" means for it.
 */
export async function PATCH(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  if (!slug) return NextResponse.json({ ok: false, error: "invalid_slug" }, { status: 400 });

  const base = await getBaseProduct(slug);
  if (!base) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  try {
    const patch = sanitizePatch(body?.patch);
    // Diffed against the base, never against the merged product: a full revert
    // has to empty the override instead of pinning today's values in place.
    const override = buildOverride(base, patch);
    await saveOverride(slug, override);
    revalidateProduct(slug, base.categorySlug);
    // The response is built from the override that was just written, not from a
    // second read: revalidateTag() only lands on the shared cache after this
    // request finishes, so a fresh read here could still return the old entry.
    const merged = applyOverride(base, override);
    return NextResponse.json(
      {
        ok: true,
        overridden: Object.keys(override).length > 0,
        product: {
          slug: merged.slug,
          name: merged.name,
          description: merged.description,
          specs: merged.specs,
          image: merged.image,
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
 * One DELETE, two meanings, decided by what the slug is:
 *
 * - a product added in the panel (no seed entry) is removed from the document
 *   and tombstoned, so its URL 404s from the next request on;
 * - a seed product cannot be deleted (it lives in code) and is instead restored:
 *   its override is cleared, which puts every field back to the original. This
 *   is the "恢复原始内容" button on the edit page.
 *
 * Sales are refused by the guard, so no role below editor can remove anything.
 */
export async function DELETE(request: Request) {
  const guard = await editorOnly();
  if (guard.response) return guard.response;

  const slug = (new URL(request.url).searchParams.get("slug") ?? "").trim();
  if (!slug) return NextResponse.json({ ok: false, error: "invalid_slug" }, { status: 400 });

  try {
    const current = await getAdminProducts().then((all) => all.find((item) => item.slug === slug));
    const seed = getSeedProduct(slug);

    if (current?.isNew) {
      await deleteNewProduct(slug);
      revalidateProduct(slug, current.categorySlug);
      return NextResponse.json(
        { ok: true, deleted: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    if (seed) {
      await clearOverride(slug);
      revalidateProduct(slug, seed.categorySlug);
      return NextResponse.json(
        { ok: true, reset: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  } catch (error) {
    return failure(error);
  }
}

/**
 * Regenerates every cached page a product change can touch: its own page, its
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
