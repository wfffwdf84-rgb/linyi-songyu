import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminProductEditor } from "@/components/admin/AdminProductEditor";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAdminSession, requireRole } from "@/lib/admin-auth";
import { getAdminProduct, getBaseProduct, getOverlayStatus } from "@/lib/catalog";
import { getCategory } from "@/lib/data/categories";
import type { CatalogProduct } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "编辑产品 · 运营后台",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ slug: string }> };

/**
 * The values 恢复原始内容 goes back to: the seed entry for a code product, or
 * the record the panel stored when the product was created. Only these fields
 * are restorable; the seed has no price and no delist flag.
 */
function baseValues(base: CatalogProduct) {
  return {
    name: base.name,
    description: base.description,
    specs: base.specs,
    image: base.image,
    inStock: base.inStock,
    price: base.price ?? null,
  };
}

export default async function AdminProductEditPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (!requireRole(session, ["owner", "editor"])) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
        <p className="flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="lock" className="text-primary" />
          仅所有者与运营可以编辑产品
        </p>
      </div>
    );
  }

  const { slug } = await params;
  const product = await getAdminProduct(slug);
  // The restore button has to go back to the base, not to the overlaid values.
  const base = await getBaseProduct(slug);
  if (!product || !base) notFound();
  const overlayStatus = await getOverlayStatus();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
        <Link href="/admin/products" className="inline-flex items-center gap-1 hover:text-primary">
          <MaterialIcon name="arrow_back" className="text-[16px]" />
          产品列表
        </Link>
        <span>/</span>
        <span className="text-on-surface">{product.partNumber}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">
          {product.name.en}
        </h1>
        <span
          className={
            product.isNew
              ? "rounded bg-primary-fixed px-2 py-0.5 text-label-caps text-on-primary-fixed"
              : "rounded bg-surface-container px-2 py-0.5 text-label-caps text-on-surface-variant"
          }
        >
          {product.isNew ? "后台新增" : "代码种子"}
        </span>
      </div>
      <p className="text-body-sm text-on-surface-variant">
        slug <span className="text-on-surface">{product.slug}</span> · 分类{" "}
        {getCategory(product.categorySlug)?.name.zh ?? product.categorySlug} · 零件号{" "}
        {product.partNumber}
      </p>

      {overlayStatus === "not_configured" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          服务器未配置 BLOB_READ_WRITE_TOKEN 或 ADMIN_SESSION_SECRET，保存会失败。
        </p>
      ) : null}
      {overlayStatus === "unreadable" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          覆盖层无法读取（Blob 不可用，或加密密钥已更换）。此时保存会覆盖已有修改，请先联系维护人员。
        </p>
      ) : null}

      <AdminProductEditor
        product={{
          slug: product.slug,
          partNumber: product.partNumber,
          name: product.name,
          description: product.description,
          specs: product.specs,
          image: product.image,
          inStock: product.inStock,
          hidden: product.hidden,
          overridden: product.overridden,
          isNew: product.isNew,
          price: product.price ?? null,
        }}
        seed={baseValues(base)}
      />

      <p className="text-body-sm text-on-surface-variant">
        前台地址：
        <Link
          href={`/parts/${product.categorySlug}/${product.slug}`}
          className="text-primary hover:underline"
          target="_blank"
        >
          /parts/{product.categorySlug}/{product.slug}
        </Link>
        （保存后该页面会重新生成，CDN 可能需要一点时间；删除新增产品后该地址返回 404）
      </p>
    </div>
  );
}
