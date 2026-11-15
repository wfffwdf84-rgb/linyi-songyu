import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNewProductForm } from "@/components/admin/AdminNewProductForm";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAdminSession, requireRole } from "@/lib/admin-auth";
import { getOverlayStatus } from "@/lib/catalog";
import { categories } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "新建产品 · 运营后台",
  robots: { index: false, follow: false },
};

export default async function AdminNewProductPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (!requireRole(session, ["owner", "editor"])) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
        <p className="mb-2 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="lock" className="text-primary" />
          仅所有者与运营可以新建产品
        </p>
        <p className="text-body-md text-on-surface-variant">业务员账号只能查看和导出询盘。</p>
      </div>
    );
  }

  const overlayStatus = await getOverlayStatus();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
        <Link href="/admin/products" className="inline-flex items-center gap-1 hover:text-primary">
          <MaterialIcon name="arrow_back" className="text-[16px]" />
          产品列表
        </Link>
        <span>/</span>
        <span className="text-on-surface">新建产品</span>
      </div>

      <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">新建产品</h1>
      <p className="rounded-xl border border-outline-variant bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
        新产品作为完整记录保存在加密覆盖层里（代码里的种子数据保持不变）。保存后会立即出现在
        产品页、分类页、/parts、搜索结果和 sitemap 中；价格仅内部可见。
      </p>

      {overlayStatus === "not_configured" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          服务器未配置 BLOB_READ_WRITE_TOKEN 或 ADMIN_SESSION_SECRET，无法保存新产品。
        </p>
      ) : null}
      {overlayStatus === "unreadable" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          覆盖层无法读取（Blob 不可用，或加密密钥已更换）。此时保存会覆盖已有修改，请先联系维护人员。
        </p>
      ) : null}

      <AdminNewProductForm
        categories={categories.map((category) => ({
          slug: category.slug,
          label: category.name.zh,
        }))}
      />
    </div>
  );
}
