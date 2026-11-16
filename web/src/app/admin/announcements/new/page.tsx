import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminAnnouncementForm } from "@/components/admin/AdminAnnouncementForm";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAdminSession, requireRole } from "@/lib/admin-auth";
import { readAnnouncementsReport } from "@/lib/announcements";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "新建公告 · 运营后台",
  robots: { index: false, follow: false },
};

export default async function AdminNewAnnouncementPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (!requireRole(session, ["owner", "editor"])) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
        <p className="mb-2 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="lock" className="text-primary" />
          仅所有者与运营可以新建公告
        </p>
        <p className="text-body-md text-on-surface-variant">业务员账号只能查看和导出询盘。</p>
      </div>
    );
  }

  const { announcements, status } = await readAnnouncementsReport();
  const activeCount = announcements.filter((item) => item.active).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
        <Link href="/admin/announcements" className="inline-flex items-center gap-1 hover:text-primary">
          <MaterialIcon name="arrow_back" className="text-[16px]" />
          公告列表
        </Link>
        <span>/</span>
        <span className="text-on-surface">新建公告</span>
      </div>

      <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">新建公告</h1>
      <p className="rounded-xl border border-outline-variant bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
        公告保存后立即进入前台：显示在每个页面最上方（站点头部之上），13 种语言共用一条。
        新建的公告默认「停用」，确认无误后再启用。
      </p>

      {status === "not_configured" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          服务器未配置 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY，无法保存公告。
        </p>
      ) : null}
      {status === "unreadable" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          公告文档无法读取（数据库不可用，或内容损坏）。此时保存会覆盖已有公告，请先联系维护人员。
        </p>
      ) : null}

      <AdminAnnouncementForm announcement={null} otherActiveCount={activeCount} />
    </div>
  );
}
