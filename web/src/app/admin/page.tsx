import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAdminSession } from "@/lib/admin-auth";
import { inquiryTimeLabel, inquiryTypeLabelZh, inquiryTypesLabelZh, monthLabelZh } from "@/lib/inquiry-labels";
import { UNKNOWN_COUNTRY, computeInquiryStats } from "@/lib/inquiry-stats";
import { inquiriesReadAt, inquiryStorageConfigured, listInquiries } from "@/lib/inquiry-store";
import { countryFlag, countryLabel } from "@/lib/visitor-geo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "概览 · 运营后台",
  robots: { index: false, follow: false },
};

function countryText(code: string) {
  if (code === UNKNOWN_COUNTRY) return "未知";
  return `${countryFlag(code)} ${countryLabel(code, "zh")}`.trim();
}

function StatCard({
  label,
  value,
  hint,
  icon,
  compact,
}: {
  label: string;
  value: number;
  hint: string;
  icon: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant bg-surface-container-lowest",
        compact ? "p-4" : "p-5",
      )}
    >
      <p className="flex items-center gap-2 text-technical-data text-on-surface-variant">
        <MaterialIcon name={icon} className="text-primary" />
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-on-surface",
          compact ? "text-headline-md" : "text-headline-lg",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-body-sm text-on-surface-variant">{hint}</p>
    </div>
  );
}

function Bars({ rows }: { rows: { key: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.key} className="flex items-center gap-3 text-body-sm">
          <span className="w-36 shrink-0 truncate text-on-surface-variant">{row.key}</span>
          <span className="h-2 flex-1 rounded bg-surface-container">
            <span
              className="block h-2 rounded bg-primary"
              style={{ width: `${Math.round((row.count / max) * 100)}%` }}
            />
          </span>
          <span className="w-10 shrink-0 text-end text-technical-data text-on-surface">{row.count}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminOverviewPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const configured = inquiryStorageConfigured();
  const inquiries = configured ? await listInquiries() : [];
  const readAt = configured ? await inquiriesReadAt() : "";
  const stats = computeInquiryStats(inquiries, readAt);
  const recent = inquiries.slice(0, 10);
  const unread = new Set(unreadIds(inquiries, readAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          <MaterialIcon name="dashboard" className="text-primary" />
          概览
        </h1>
        {/* A file download, not a client-side navigation, so this stays an anchor. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/admin/inquiries/export"
          className="inline-flex items-center gap-1 rounded border border-outline-variant px-3 py-1 text-technical-data text-on-surface-variant hover:border-primary"
        >
          <MaterialIcon name="download" className="text-[16px]" />
          导出 CSV
        </a>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-error bg-error-container p-6 text-body-md text-on-error-container">
          服务器未配置 BLOB_READ_WRITE_TOKEN，无法读取询盘。
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="今日询盘"
          value={stats.today}
          hint="按北京时间今天收到"
          icon="today"
        />
        <StatCard
          label="未读"
          value={stats.unread}
          hint="需要跟进的询盘"
          icon="mark_email_unread"
        />
        <StatCard label="询盘总数" value={stats.total} hint="全部收到的询盘" icon="inbox" compact />
        <StatCard
          label="本月新增"
          value={stats.thisMonth}
          hint="按北京时间统计"
          icon="trending_up"
          compact
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-3 flex items-center gap-2 text-headline-md text-on-surface">
            <MaterialIcon name="public" className="text-primary" />
            国家分布（前 10）
          </h2>
          {stats.byCountry.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">暂无数据。</p>
          ) : (
            <Bars rows={stats.byCountry.map((row) => ({ key: countryText(row.key), count: row.count }))} />
          )}
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-3 flex items-center gap-2 text-headline-md text-on-surface">
            <MaterialIcon name="category" className="text-primary" />
            询盘类型
          </h2>
          {stats.byType.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">暂无数据。</p>
          ) : (
            <Bars
              rows={stats.byType.map((row) => ({ key: inquiryTypeLabelZh(row.key), count: row.count }))}
            />
          )}
        </section>
      </div>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-3 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="calendar_month" className="text-primary" />
          近 6 个月
        </h2>
        <Bars
          rows={stats.byMonth.map((row) => ({ key: monthLabelZh(row.key), count: row.count }))}
        />
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-headline-md text-on-surface">
            <MaterialIcon name="list_alt" className="text-primary" />
            最近 10 条询盘
          </h2>
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center gap-1 text-technical-data text-primary hover:underline"
          >
            查看全部
            <MaterialIcon name="chevron_right" className="text-[16px]" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">还没有收到询盘。</p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {recent.map((inquiry) => (
              <li key={inquiry.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-body-sm">
                {unread.has(inquiry.id) ? (
                  <span className="rounded bg-error px-2 py-0.5 text-label-caps text-on-error">新</span>
                ) : null}
                <span className="text-technical-data text-on-surface-variant">
                  {inquiryTimeLabel(inquiry.receivedAt)}
                </span>
                <span className="text-on-surface">{countryText(inquiry.ipCountry?.toUpperCase() || UNKNOWN_COUNTRY)}</span>
                <span className="text-technical-data text-on-surface">
                  公司 <span className={inquiry.company ? "" : "text-on-surface-variant"}>{inquiry.company || "未填"}</span>
                </span>
                <span className="text-technical-data text-on-surface">{inquiry.contact}</span>
                {inquiry.types.length > 0 ? (
                  <span className="text-on-surface-variant">{inquiryTypesLabelZh(inquiry.types)}</span>
                ) : null}
                <span className="min-w-0 flex-1 truncate text-on-surface-variant">
                  {inquiry.message || inquiry.notes || inquiry.brand || ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Ids newer than the desk's read watermark. */
function unreadIds(inquiries: { id: string; receivedAt: string }[], readAt: string) {
  return inquiries.filter((inquiry) => !readAt || inquiry.receivedAt > readAt).map((inquiry) => inquiry.id);
}
