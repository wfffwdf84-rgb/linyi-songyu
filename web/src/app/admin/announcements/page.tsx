import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminAnnouncementActions } from "@/components/admin/AdminAnnouncementActions";
import { AnnouncementBarView } from "@/components/layout/AnnouncementBarView";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAdminSession, requireRole } from "@/lib/admin-auth";
import { inquiryTimeLabel } from "@/lib/inquiry-labels";
import {
  announcementWindowState,
  pickActiveAnnouncement,
  readAnnouncementsReport,
  sortAnnouncementsByNewest,
  type AnnouncementWindowState,
} from "@/lib/announcements";
import { announcementStyleLabels } from "@/lib/announcement-styles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "公告 · 运营后台",
  robots: { index: false, follow: false },
};

const WINDOW_LABELS: Record<AnnouncementWindowState, string> = {
  always: "长期有效",
  scheduled: "未开始",
  live: "进行中",
  expired: "已过期",
};

/** Same operators' clock the inquiry desk uses (UTC+8), so timestamps compare. */
const timeLabel = inquiryTimeLabel;

function WindowBadge({ state }: { state: AnnouncementWindowState }) {
  const tone =
    state === "live"
      ? "bg-secondary-container text-on-secondary-container"
      : state === "expired"
        ? "bg-error-container text-on-error-container"
        : state === "scheduled"
          ? "bg-primary-fixed text-on-primary-fixed"
          : "bg-surface-container text-on-surface-variant";
  return <span className={`rounded px-2 py-0.5 text-label-caps ${tone}`}>{WINDOW_LABELS[state]}</span>;
}

export default async function AdminAnnouncementsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (!requireRole(session, ["owner", "editor"])) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
        <p className="mb-2 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="lock" className="text-primary" />
          仅所有者与运营可以管理公告
        </p>
        <p className="text-body-md text-on-surface-variant">业务员账号只能查看和导出询盘。</p>
      </div>
    );
  }

  const { announcements, status } = await readAnnouncementsReport();
  const rows = sortAnnouncementsByNewest(announcements);
  const now = new Date();
  const shown = pickActiveAnnouncement(rows, now);
  const activeCount = rows.filter((item) => item.active).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="flex items-center gap-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          <MaterialIcon name="campaign" className="text-primary" />
          公告
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-body-sm text-on-surface-variant">
            共 {rows.length} 条 · 启用 {activeCount} 条
          </p>
          <Link
            href="/admin/announcements/new"
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-body-md font-semibold text-on-primary"
          >
            <MaterialIcon name="add" className="text-[18px]" />
            新建公告
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
        <span className="flex items-center gap-2">
          <MaterialIcon name="info" className="text-[18px] text-primary" />
          公告显示在每个页面最上方（站点头部之上），最多显示一条，其它 12 种语言只回退英文。
        </span>
        <details className="ms-auto">
          <summary className="cursor-pointer select-none text-primary">说明</summary>
          <p className="mt-2 max-w-2xl">
            前台只会显示「启用 + 当前在时间窗内」的公告；如果同时有多条满足条件，取创建时间最新的一条。
            因此<b>请只保留一条启用</b> —— 系统不会轮播，其余启用公告只会让人误以为都在生效。
          </p>
        </details>
      </div>

      {status === "not_configured" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          服务器未配置 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY，公告无法读取与保存。前台此时不显示公告。
        </p>
      ) : null}
      {status === "unreadable" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          公告文档无法读取（数据库不可用，或内容损坏）。前台此时不显示公告；为避免覆盖已有公告，
          请在存储恢复后再保存。
        </p>
      ) : null}

      {activeCount > 1 ? (
        <div className="flex items-start gap-2 rounded-xl border border-outline bg-secondary-container p-4 text-body-md text-on-secondary-container">
          <MaterialIcon name="warning" className="text-[20px]" />
          <span>
            <b>当前有 {activeCount} 条公告处于启用状态。</b>
            前台仍然只显示一条（创建时间最新且当前在时间窗内的那条），其余不会出现，也不会轮播。
            建议停用其中 {activeCount - 1} 条，只保留一条启用。
          </span>
        </div>
      ) : null}

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-3 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="visibility" className="text-primary" />
          前台当前显示
        </h2>
        {shown ? (
          <div className="space-y-2">
            <AnnouncementBarView
              style={shown.style}
              text={shown.text.zh || shown.text.en}
              href={shown.href}
              locale="zh"
              dismissible={shown.dismissible}
            />
            <p className="text-body-sm text-on-surface-variant">
              创建于 {timeLabel(shown.createdAt)} · {announcementStyleLabels[shown.style]} ·{" "}
              {shown.href ? `链接 ${shown.href}` : "无链接"} · {shown.dismissible ? "可关闭" : "不可关闭"}
            </p>
          </div>
        ) : (
          <p className="text-body-sm text-on-surface-variant">
            当前没有可显示的公告：需要「启用」，并且在开始 / 结束时间窗内。前台不会渲染任何公告 DOM。
          </p>
        )}
      </section>

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full min-w-[60rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container text-technical-data text-on-surface-variant">
              <th className="px-4 py-2 font-semibold">状态</th>
              <th className="px-4 py-2 font-semibold">样式</th>
              <th className="px-4 py-2 font-semibold">内容（英 / 中）</th>
              <th className="px-4 py-2 font-semibold">时间窗</th>
              <th className="px-4 py-2 font-semibold">创建时间</th>
              <th className="px-4 py-2 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-body-md text-on-surface-variant">
                  还没有公告。新建一条后，前台会在页面最上方显示。
                </td>
              </tr>
            ) : (
              rows.map((item) => {
                const state = announcementWindowState(item, now);
                const isShown = shown?.id === item.id;
                return (
                  <tr key={item.id} className="border-b border-outline-variant last:border-0">
                    <td className="px-4 py-3 align-top">
                      <span className="flex flex-wrap gap-1">
                        {item.active ? (
                          <span className="rounded bg-primary-fixed px-2 py-0.5 text-label-caps text-on-primary-fixed">
                            启用
                          </span>
                        ) : (
                          <span className="rounded bg-surface-container px-2 py-0.5 text-label-caps text-on-surface-variant">
                            停用
                          </span>
                        )}
                        {isShown ? (
                          <span className="rounded bg-primary px-2 py-0.5 text-label-caps text-on-primary">
                            前台显示中
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-body-sm text-on-surface">
                      {announcementStyleLabels[item.style]}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="block max-w-[26rem] truncate text-body-md text-on-surface">
                        {item.text.en}
                      </span>
                      <span className="block max-w-[26rem] truncate text-body-sm text-on-surface-variant">
                        {item.text.zh || "（无中文，其它语言显示英文）"}
                      </span>
                      <span className="block text-technical-data text-on-surface-variant/70">
                        {item.href || "无链接"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="block">
                        <WindowBadge state={state} />
                      </span>
                      <span className="mt-1 block text-technical-data text-on-surface-variant">
                        {item.startAt ? timeLabel(item.startAt) : "不限"} →{" "}
                        {item.endAt ? timeLabel(item.endAt) : "不限"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-technical-data text-on-surface-variant">
                      {timeLabel(item.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/announcements/${item.id}`}
                          className="inline-flex items-center gap-1 rounded border border-outline-variant px-3 py-1 text-technical-data text-primary hover:border-primary"
                        >
                          编辑
                          <MaterialIcon name="chevron_right" className="text-[16px]" />
                        </Link>
                        <AdminAnnouncementActions
                          id={item.id}
                          active={item.active}
                          label={item.text.zh || item.text.en}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
