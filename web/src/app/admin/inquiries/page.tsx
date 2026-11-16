import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDeleteInquiryButton, AdminMarkReadButton } from "@/components/admin/AdminInquiryActions";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAdminSession, requireRole } from "@/lib/admin-auth";
import { inquiryTimeLabel, inquiryTypesLabelZh } from "@/lib/inquiry-labels";
import { inquiriesReadAt, inquiryStorageConfigured, listInquiries } from "@/lib/inquiry-store";
import { phoneCountry } from "@/lib/phone-country";
import { businessTime, countryFlag, countryLabel, localTime } from "@/lib/visitor-geo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "询盘 · 运营后台",
  robots: { index: false, follow: false },
};

/** Digits only, so a stored "+86 175 6815 5882" still opens a WhatsApp chat. */
function whatsappHref(contact: string) {
  const digits = contact.replace(/\D/g, "");
  return digits.length >= 6 ? `https://wa.me/${digits}` : "";
}

export default async function AdminInquiriesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  // Sales reads and exports leads but never deletes one.
  const canDelete = requireRole(session, ["owner", "editor"]);

  const configured = inquiryStorageConfigured();
  const inquiries = configured ? await listInquiries() : [];
  const readAt = configured ? await inquiriesReadAt() : "";
  // listInquiries returns newest first, so anything above the watermark is new.
  const unread = readAt ? inquiries.filter((inquiry) => inquiry.receivedAt > readAt) : inquiries;
  const unreadSet = new Set(unread.map((inquiry) => inquiry.id));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          <MaterialIcon name="inbox" className="text-primary" />
          询盘
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-technical-data">
          {unread.length > 0 ? (
            <span className="rounded bg-error px-3 py-1 font-semibold text-on-error">{unread.length} 条未读</span>
          ) : null}
          <span className="rounded bg-surface-container px-3 py-1 text-on-surface-variant">
            共 {inquiries.length} 条
          </span>
          {unread.length > 0 ? <AdminMarkReadButton upTo={unread[0].receivedAt} count={unread.length} /> : null}
          {/* A file download, not a client-side navigation, so this stays an anchor. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/admin/inquiries/export"
            className="inline-flex items-center gap-1 rounded border border-outline-variant px-3 py-1 text-on-surface-variant hover:border-primary"
          >
            <MaterialIcon name="download" className="text-[16px]" />
            导出 CSV
          </a>
        </div>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-error bg-error-container p-6 text-body-md text-on-error-container">
          服务器未配置 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY，无法读取询盘。
        </p>
      ) : inquiries.length === 0 ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
          <p className="mb-2 text-headline-md text-on-surface">还没有收到询盘</p>
          <p className="text-body-md text-on-surface-variant">站点联系页的每一份提交都会出现在这里。</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {inquiries.map((inquiry) => {
            const wa = whatsappHref(inquiry.contact);
            const ipCountry = inquiry.ipCountry ?? "";
            const numberCountry = phoneCountry(inquiry.contact);
            const placedAt = localTime(inquiry.receivedAt, inquiry.ipTimezone ?? "");
            // The operators' own clock, so a lead from another zone can be placed
            // against the working day without doing the arithmetic in your head.
            const beijingAt = businessTime(inquiry.receivedAt);
            return (
              <li
                key={inquiry.id}
                className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {unreadSet.has(inquiry.id) ? (
                    <span className="rounded bg-error px-2 py-0.5 text-label-caps text-on-error">新</span>
                  ) : null}
                  {inquiry.urgent ? (
                    <span className="rounded bg-error px-2 py-0.5 text-label-caps text-on-error">紧急</span>
                  ) : null}
                  <span className="rounded bg-surface-container px-2 py-0.5 text-technical-data text-on-surface-variant">
                    {inquiry.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-technical-data text-on-surface-variant">
                    {inquiryTimeLabel(inquiry.receivedAt)}
                  </span>
                  <span className="text-technical-data text-on-surface-variant">
                    {inquiry.locale || "未知"} · {inquiry.page || "未知"}
                  </span>
                  <span className="ms-auto">
                    {canDelete ? <AdminDeleteInquiryButton id={inquiry.id} /> : null}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="text-headline-md text-on-surface">{inquiry.contact}</span>
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-[#25D366] px-3 py-1 text-technical-data text-white"
                    >
                      <MaterialIcon name="chat" className="text-[16px]" />
                      WhatsApp
                    </a>
                  ) : null}
                  {inquiry.company ? (
                    <span className="rounded bg-secondary-container px-2 py-0.5 text-body-md text-on-secondary-container">
                      公司 {inquiry.company}
                    </span>
                  ) : (
                    <span className="text-body-sm text-on-surface-variant">公司未填</span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded bg-surface-container px-2 py-0.5 text-technical-data text-on-surface-variant">
                    <MaterialIcon name="mail" className="text-[16px]" />
                    邮箱 <span className="text-on-surface">{inquiry.email || "—"}</span>
                  </span>
                </div>

                {ipCountry || numberCountry || placedAt ? (
                  <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-technical-data text-on-surface-variant">
                    {ipCountry ? (
                      <span>
                        IP 归属{" "}
                        <span className="text-on-surface">
                          {countryFlag(ipCountry.toUpperCase())} {countryLabel(ipCountry.toUpperCase(), "zh")}
                        </span>
                        {inquiry.ipCity ? ` · ${inquiry.ipCity}` : ""}
                      </span>
                    ) : null}
                    {numberCountry ? (
                      <span>
                        号码归属{" "}
                        <span className="text-on-surface">
                          {countryFlag(numberCountry)} {countryLabel(numberCountry, "zh")}
                        </span>
                      </span>
                    ) : null}
                    {placedAt ? (
                      <span>
                        当地时间 <span className="text-on-surface">{placedAt}</span>
                      </span>
                    ) : null}
                    {beijingAt ? (
                      <span>
                        北京时间 <span className="text-on-surface">{beijingAt}</span>
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-body-sm sm:grid-cols-2">
                  {inquiry.types.length > 0 ? (
                    <div>
                      <dt className="text-on-surface-variant">询盘类型</dt>
                      <dd className="text-on-surface">{inquiryTypesLabelZh(inquiry.types)}</dd>
                    </div>
                  ) : null}
                  {inquiry.brand ? (
                    <div>
                      <dt className="text-on-surface-variant">品牌</dt>
                      <dd className="text-on-surface">{inquiry.brand}</dd>
                    </div>
                  ) : null}
                  {inquiry.vin ? (
                    <div>
                      <dt className="text-on-surface-variant">车架号</dt>
                      <dd className="text-on-surface">{inquiry.vin}</dd>
                    </div>
                  ) : null}
                  {inquiry.photoName ? (
                    <div>
                      <dt className="text-on-surface-variant">照片</dt>
                      <dd className="text-on-surface">{inquiry.photoName}</dd>
                    </div>
                  ) : null}
                  {inquiry.items.length > 0 ? (
                    <div className="sm:col-span-2">
                      <dt className="text-on-surface-variant">零件</dt>
                      <dd className="text-on-surface">
                        {inquiry.items.map((item) => `${item.partNumber} ×${item.qty}`).join("，")}
                      </dd>
                    </div>
                  ) : null}
                  {inquiry.message ? (
                    <div className="sm:col-span-2">
                      <dt className="text-on-surface-variant">留言内容</dt>
                      <dd className="whitespace-pre-wrap text-on-surface">{inquiry.message}</dd>
                      {inquiry.messageZh ? (
                        <dd className="mt-1 flex gap-2 whitespace-pre-wrap border-s-2 border-primary/50 ps-3 text-on-surface-variant">
                          <MaterialIcon name="translate" className="mt-0.5 shrink-0 text-[16px] text-primary" />
                          <span>{inquiry.messageZh}</span>
                        </dd>
                      ) : null}
                    </div>
                  ) : null}
                  {inquiry.notes ? (
                    <div className="sm:col-span-2">
                      <dt className="text-on-surface-variant">备注</dt>
                      <dd className="whitespace-pre-wrap text-on-surface">{inquiry.notes}</dd>
                      {inquiry.notesZh ? (
                        <dd className="mt-1 flex gap-2 whitespace-pre-wrap border-s-2 border-primary/50 ps-3 text-on-surface-variant">
                          <MaterialIcon name="translate" className="mt-0.5 shrink-0 text-[16px] text-primary" />
                          <span>{inquiry.notesZh}</span>
                        </dd>
                      ) : null}
                    </div>
                  ) : null}
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
