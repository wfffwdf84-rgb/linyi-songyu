import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminProductEditor } from "@/components/admin/AdminProductEditor";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAdminSession, requireRole } from "@/lib/admin-auth";
import { getAdminProduct, getOverlayStatus, getSeedProduct } from "@/lib/catalog";
import { getCategory } from "@/lib/data/categories";
import type { Product } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "编辑产品 · 运营后台",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ slug: string }> };

/**
 * Seed values, so the operator can see what the original was and put it back.
 * Only the copy and stock fields: the seed has no price and no delist flag.
 */
function seedValues(product: Product) {
  return {
    name: product.name,
    description: product.description,
    specs: product.specs,
    inStock: product.inStock,
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
  // The "载入原始内容" button has to restore the seed, not the overlaid values.
  const seed = getSeedProduct(slug);
  if (!product || !seed) notFound();
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

      <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">
        {product.name.en}
      </h1>
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
          inStock: product.inStock,
          hidden: product.hidden,
          overridden: product.overridden,
          price: product.price ?? null,
        }}
        seed={seedValues(seed)}
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
        （保存后该页面会重新生成，CDN 可能需要一点时间）
      </p>
    </div>
  );
}
