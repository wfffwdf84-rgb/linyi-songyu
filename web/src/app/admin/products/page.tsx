import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { AdminPageJump } from "@/components/admin/AdminPageJump";
import { getAdminSession, requireRole } from "@/lib/admin-auth";
import { getAdminProducts, getOverlayStatus, type AdminProduct } from "@/lib/catalog";
import { getCategory } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "产品 · 运营后台",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
};

function firstOf(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function matches(product: AdminProduct, needle: string) {
  if (!needle) return true;
  return [product.partNumber, product.slug, product.name.en, product.name.zh, product.categorySlug]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function priceLabel(product: AdminProduct) {
  if (!product.price) return "—";
  const amount = product.price.amount.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  return `${product.price.currency} ${amount}`;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (!requireRole(session, ["owner", "editor"])) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
        <p className="mb-2 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="lock" className="text-primary" />
          仅所有者与运营可以编辑产品
        </p>
        <p className="text-body-md text-on-surface-variant">业务员账号只能查看和导出询盘。</p>
      </div>
    );
  }

  const query = await searchParams;
  const q = firstOf(query.q).trim();
  const requestedPage = Number.parseInt(firstOf(query.page), 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const overlayStatus = await getOverlayStatus();
  const all = await getAdminProducts();
  const hits = all.filter((product) => matches(product, q.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(hits.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = hits.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const edited = all.filter((product) => product.overridden).length;
  const added = all.filter((product) => product.isNew).length;
  const delisted = all.filter((product) => product.hidden).length;

  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (target > 1) params.set("page", String(target));
    const suffix = params.toString();
    return suffix ? `/admin/products?${suffix}` : "/admin/products";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="flex items-center gap-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          <MaterialIcon name="widgets" className="text-primary" />
          产品
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-body-sm text-on-surface-variant">
            共 {all.length} 个产品 · 后台新增 {added} 个 · 已修改 {edited} 个 · 已下架 {delisted} 个
          </p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-body-md font-semibold text-on-primary"
          >
            <MaterialIcon name="add" className="text-[18px]" />
            新建产品
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
        <span>价格仅内部可见，前台任何页面都不会显示。</span>
        <details className="ms-auto">
          <summary className="cursor-pointer select-none text-primary">说明</summary>
          <p className="mt-2 max-w-2xl">
            代码里的产品仍然只读，修改作为「覆盖层」保存在数据库，前台渲染时叠加；新产品则是完整记录。
            新增产品排在最前面，删除只对新增产品开放（代码里的产品可以「恢复原始内容」）。
          </p>
        </details>
      </div>

      {overlayStatus === "not_configured" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          服务器未配置 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 或 ADMIN_SESSION_SECRET，覆盖层无法读取与保存。
          前台此时显示的是种子数据。
        </p>
      ) : null}
      {overlayStatus === "unreadable" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          覆盖层无法读取（数据库不可用，或加密密钥已更换），当前显示的是种子数据，请勿保存，
          否则会覆盖已有修改。
        </p>
      ) : null}

      <form action="/admin/products" method="get" className="flex flex-wrap gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">搜索产品</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="按零件号 / 名称 / slug 搜索"
            className="w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2 text-body-md font-semibold text-on-primary"
        >
          搜索
        </button>
        {q ? (
          <Link
            href="/admin/products"
            className="flex items-center rounded-lg border border-outline-variant px-4 py-2 text-body-md text-on-surface-variant hover:border-primary"
          >
            清除
          </Link>
        ) : null}
      </form>

      <p className="text-body-sm text-on-surface-variant">
        {q ? `“${q}” 匹配 ${hits.length} 个产品` : `显示全部 ${hits.length} 个产品`}
        {pageCount > 1 ? ` · 第 ${current} / ${pageCount} 页` : ""}
      </p>

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container text-technical-data text-on-surface-variant">
              <th className="px-4 py-2 font-semibold">零件号</th>
              <th className="px-4 py-2 font-semibold">名称（英 / 中）</th>
              <th className="px-4 py-2 font-semibold">分类</th>
              <th className="px-4 py-2 font-semibold">状态</th>
              <th className="px-4 py-2 font-semibold">价格（内部）</th>
              <th className="px-4 py-2 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-body-md text-on-surface-variant">
                  没有匹配的产品。
                </td>
              </tr>
            ) : (
              rows.map((product) => (
                <tr key={product.slug} className="border-b border-outline-variant last:border-0">
                  <td className="px-4 py-3 align-top text-technical-data text-on-surface">
                    {product.partNumber}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="block text-body-md text-on-surface">{product.name.en}</span>
                    <span className="block text-body-sm text-on-surface-variant">{product.name.zh}</span>
                    <span className="block text-technical-data text-on-surface-variant/70">
                      {product.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-body-sm text-on-surface-variant">
                    {getCategory(product.categorySlug)?.name.zh ?? product.categorySlug}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="flex flex-wrap gap-1">
                      {product.isNew ? (
                        <span className="rounded bg-primary-fixed px-2 py-0.5 text-label-caps text-on-primary-fixed">
                          新增
                        </span>
                      ) : null}
                      {product.overridden ? (
                        <span className="rounded bg-primary-fixed px-2 py-0.5 text-label-caps text-on-primary-fixed">
                          已改
                        </span>
                      ) : (
                        <span className="rounded bg-surface-container px-2 py-0.5 text-label-caps text-on-surface-variant">
                          原始
                        </span>
                      )}
                      {product.inStock ? (
                        <span className="rounded bg-secondary-container px-2 py-0.5 text-label-caps text-on-secondary-container">
                          在库
                        </span>
                      ) : (
                        <span className="rounded bg-surface-container px-2 py-0.5 text-label-caps text-on-surface-variant">
                          缺货
                        </span>
                      )}
                      {product.hidden ? (
                        <span className="rounded bg-error px-2 py-0.5 text-label-caps text-on-error">
                          已下架
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-technical-data text-on-surface">
                    {priceLabel(product)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/products/${product.slug}`}
                      className="inline-flex items-center gap-1 rounded border border-outline-variant px-3 py-1 text-technical-data text-primary hover:border-primary"
                    >
                      编辑
                      <MaterialIcon name="chevron_right" className="text-[16px]" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <nav aria-label="分页" className="flex flex-wrap items-center gap-2">
          {current > 1 ? (
            <Link
              href={pageHref(current - 1)}
              className="rounded border border-outline-variant px-3 py-1 text-body-sm text-on-surface-variant hover:border-primary"
            >
              上一页
            </Link>
          ) : null}
          {Array.from({ length: pageCount }, (_, index) => index + 1)
            .filter((target) => Math.abs(target - current) <= 2 || target === 1 || target === pageCount)
            .map((target) => (
              <Link
                key={target}
                href={pageHref(target)}
                aria-current={target === current ? "page" : undefined}
                className={
                  target === current
                    ? "rounded bg-primary px-3 py-1 text-body-sm font-semibold text-on-primary"
                    : "rounded border border-outline-variant px-3 py-1 text-body-sm text-on-surface-variant hover:border-primary"
                }
              >
                {target}
              </Link>
            ))}
          {current < pageCount ? (
            <Link
              href={pageHref(current + 1)}
              className="rounded border border-outline-variant px-3 py-1 text-body-sm text-on-surface-variant hover:border-primary"
            >
              下一页
            </Link>
          ) : null}
          <AdminPageJump current={current} pageCount={pageCount} query={q} />
        </nav>
      ) : null}
    </div>
  );
}
