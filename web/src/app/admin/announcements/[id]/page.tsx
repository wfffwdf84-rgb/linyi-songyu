import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminAnnouncementForm } from "@/components/admin/AdminAnnouncementForm";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAdminSession, requireRole } from "@/lib/admin-auth";
import { inquiryTimeLabel } from "@/lib/inquiry-labels";
import {
  announcementWindowState,
  readAnnouncementsReport,
  type AnnouncementWindowState,
} from "@/lib/announcements";
import { announcementStyleLabels } from "@/lib/announcement-styles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "编辑公告 · 运营后台",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

const STATE_LABELS: Record<AnnouncementWindowState, string> = {
  always: "长期有效",
  scheduled: "尚未开始",
  live: "进行中",
  expired: "已过期",
};

export default async function AdminAnnouncementEditPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (!requireRole(session, ["owner", "editor"])) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
        <p className="flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="lock" className="text-primary" />
          仅所有者与运营可以编辑公告
        </p>
      </div>
    );
  }

  const { id } = await params;
  const { announcements, status } = await readAnnouncementsReport();
  const announcement = announcements.find((item) => item.id === id) ?? null;

  // An unreadable document looks exactly like "this id is gone"; say so instead
  // of pretending the announcement was deleted.
  if (!announcement && status !== "") {
    return (
      <div className="space-y-5">
        <Link href="/admin/announcements" className="inline-flex items-center gap-1 text-body-sm text-on-surface-variant hover:text-primary">
          <MaterialIcon name="arrow_back" className="text-[16px]" />
          公告列表
        </Link>
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          {status === "not_configured"
            ? "服务器未配置 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY，公告无法读取。"
            : "公告文档无法读取（数据库不可用，或内容损坏），暂时无法编辑。"}
        </p>
      </div>
    );
  }
  if (!announcement) notFound();

  const state = announcementWindowState(announcement, new Date());
  const otherActiveCount = announcements.filter((item) => item.active && item.id !== id).length;
  const foreground =
    !announcement.active
      ? "停用中，前台不显示"
      : state === "live" || state === "always"
        ? "前台显示中"
        : `前台不显示（${STATE_LABELS[state]}）`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
        <Link href="/admin/announcements" className="inline-flex items-center gap-1 hover:text-primary">
          <MaterialIcon name="arrow_back" className="text-[16px]" />
          公告列表
        </Link>
        <span>/</span>
        <span className="text-on-surface">{announcement.text.zh || announcement.text.en}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">编辑公告</h1>
        <span className="rounded bg-surface-container px-2 py-0.5 text-label-caps text-on-surface-variant">
          {announcementStyleLabels[announcement.style]}
        </span>
        <span
          className={
            announcement.active
              ? "rounded bg-primary-fixed px-2 py-0.5 text-label-caps text-on-primary-fixed"
              : "rounded bg-surface-container px-2 py-0.5 text-label-caps text-on-surface-variant"
          }
        >
          {foreground}
        </span>
      </div>
      <p className="text-body-sm text-on-surface-variant">
        创建于 {inquiryTimeLabel(announcement.createdAt)} · 最后修改{" "}
        {inquiryTimeLabel(announcement.updatedAt)} · id{" "}
        <span className="text-technical-data">{announcement.id}</span>
      </p>

      {status === "unreadable" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          公告文档无法读取（数据库不可用，或内容损坏）。此时保存会覆盖已有公告，请先联系维护人员。
        </p>
      ) : null}
      {status === "not_configured" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          服务器未配置 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY，保存会失败。
        </p>
      ) : null}

      <AdminAnnouncementForm announcement={announcement} otherActiveCount={otherActiveCount} />

      <p className="text-body-sm text-on-surface-variant">
        前台地址：{" "}
        <Link href="/" target="_blank" className="text-primary hover:underline">
          /
        </Link>{" "}
        （公告显示在页面最上方；保存后所有页面会重新生成，CDN 可能需要一点时间）
      </p>
    </div>
  );
}
