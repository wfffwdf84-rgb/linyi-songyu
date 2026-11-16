import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminCopyEditor } from "@/components/admin/AdminCopyEditor";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAdminSession, requireRole } from "@/lib/admin-auth";
import { readCopyGroupRows, readCopyOverridesFor, readCopyOverridesReport } from "@/lib/copy";
import { COPY_GROUPS, findCopyGroup } from "@/lib/copy-rules";
import { appLocales, isAppLocale, localeNames, type AppLocale } from "@/lib/locales";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "文案 · 运营后台",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ locale?: string; group?: string }>;
};

/**
 * The copy editor.
 *
 * This page is the only place operators change site wording. It renders one
 * language and one group at a time - the language dropdown is the "current
 * language" the banner talks about - and every row carries the key, the shipped
 * text and the value that is live right now.
 *
 * The data is read here rather than fetched: it is one store read and the
 * message bundle, and the same functions serve the API's GET.
 */
export default async function AdminCopyPage({ searchParams }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (!requireRole(session, ["owner", "editor"])) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
        <p className="mb-2 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="lock" className="text-primary" />
          仅所有者与运营可以编辑网站文案
        </p>
        <p className="text-body-md text-on-surface-variant">业务员账号只能查看和导出询盘。</p>
      </div>
    );
  }

  const params = await searchParams;
  const requestedLocale = params.locale ?? "";
  // Chinese is the source every other language is translated from, so it is the
  // language the panel opens on.
  const locale: AppLocale = isAppLocale(requestedLocale) ? requestedLocale : "zh";
  const group = findCopyGroup(params.group ?? "") ?? COPY_GROUPS[0];

  const [rows, overrides, report] = await Promise.all([
    readCopyGroupRows(locale, group.id),
    readCopyOverridesFor(locale),
    readCopyOverridesReport(),
  ]);

  return (
    <AdminCopyEditor
      locale={locale}
      groupId={group.id}
      groups={COPY_GROUPS.map((item) => ({
        id: item.id,
        label: item.label,
        hint: item.hint,
        namespaces: [...item.namespaces],
      }))}
      locales={appLocales.map((code) => ({ code, label: localeNames[code] }))}
      rows={(rows ?? []).map((row) => ({
        key: row.key,
        original: row.original,
        value: row.value,
        overridden: row.overridden,
      }))}
      localeOverrideCount={Object.keys(overrides).length}
      status={report.status}
    />
  );
}
