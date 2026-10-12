import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/components/layout/SiteShell";
import { InquiryDeskLogin } from "@/components/admin/InquiryDeskLogin";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { InquiryDeskLogout } from "@/components/admin/InquiryDeskLogout";
import { isInquiryDeskAuthed } from "@/lib/inquiry-auth";
import { inquiryStorageConfigured, inquiriesReadAt, listInquiries } from "@/lib/inquiry-store";
import { InquiryDeskMarkRead } from "@/components/admin/InquiryDeskMarkRead";
import { deskText } from "@/lib/desk-text";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: deskText(locale).metaTitle,
    robots: { index: false, follow: false },
  };
}

/** Digits only, so a stored "+86 175 6815 5882" still opens a WhatsApp chat. */
function whatsappHref(contact: string) {
  const digits = contact.replace(/\D/g, "");
  return digits.length >= 6 ? `https://wa.me/${digits}` : "";
}

export default async function InquiryDeskPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tx = deskText(locale);
  const tQuote = await getTranslations("quote");

  /** Stored types are internal ids; show the same wording the form used. */
  function typeLabel(id: string) {
    try {
      return tQuote(`type_${id}`);
    } catch {
      return id;
    }
  }

  const jar = await cookies();
  if (!isInquiryDeskAuthed(jar.toString())) {
    return (
      <SiteShell>
        <main className="mx-auto w-full max-w-container-max px-margin-mobile py-10 md:px-margin-desktop">
          <InquiryDeskLogin text={tx} />
        </main>
      </SiteShell>
    );
  }

  const configured = inquiryStorageConfigured();
  const inquiries = configured ? await listInquiries() : [];
  const readAt = configured ? await inquiriesReadAt() : "";
  // listInquiries returns newest first, so anything above the watermark is new.
  const unread = readAt ? inquiries.filter((inquiry) => inquiry.receivedAt > readAt) : inquiries;

  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-container-max px-margin-mobile py-10 md:px-margin-desktop">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="flex items-center gap-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
            <MaterialIcon name="inbox" className="text-primary" />
            {tx.title}
          </h1>
          <div className="flex items-center gap-3 text-technical-data">
            {unread.length > 0 ? (
              <span className="rounded bg-error px-3 py-1 font-semibold text-on-error">
                {unread.length}
                {tx.newSuffix}
              </span>
            ) : null}
            <span className="rounded bg-surface-container px-3 py-1 text-on-surface-variant">
              {inquiries.length}
              {tx.capturedSuffix}
            </span>
            <InquiryDeskLogout label={tx.signOut} />
          </div>
        </div>

        {!configured ? (
          <p className="rounded-xl border border-error bg-error-container p-6 text-body-md text-on-error-container">
            {tx.missingStorage}
          </p>
        ) : inquiries.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
            <p className="mb-2 text-headline-md text-on-surface">{tx.emptyTitle}</p>
            <p className="text-body-md text-on-surface-variant">{tx.emptyBody}</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {unread.length > 0 ? <InquiryDeskMarkRead upTo={unread[0].receivedAt} /> : null}
            {inquiries.map((inquiry) => {
              const wa = whatsappHref(inquiry.contact);
              return (
                <li
                  key={inquiry.id}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {unread.some((item) => item.id === inquiry.id) ? (
                      <span className="rounded bg-error px-2 py-0.5 text-label-caps text-on-error">
                        {tx.newChip}
                      </span>
                    ) : null}
                    {inquiry.urgent ? (
                      <span className="rounded bg-error px-2 py-0.5 text-label-caps text-on-error">
                        {tx.urgentChip}
                      </span>
                    ) : null}
                    <span className="rounded bg-surface-container px-2 py-0.5 text-technical-data text-on-surface-variant">
                      {inquiry.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-technical-data text-on-surface-variant">
                      {new Date(inquiry.receivedAt).toUTCString()}
                    </span>
                    <span className="text-technical-data text-on-surface-variant">
                      {inquiry.locale || tx.unknown} · {inquiry.page || tx.unknown}
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
                      <span className="text-body-md text-on-surface-variant">{inquiry.company}</span>
                    ) : null}
                  </div>

                  <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-body-sm sm:grid-cols-2">
                    {inquiry.types.length > 0 ? (
                      <div>
                        <dt className="text-on-surface-variant">{tx.fieldTypes}</dt>
                        <dd className="text-on-surface">
                          {inquiry.types.map((id) => typeLabel(id)).join("、")}
                        </dd>
                      </div>
                    ) : null}
                    {inquiry.brand ? (
                      <div>
                        <dt className="text-on-surface-variant">{tx.fieldBrand}</dt>
                        <dd className="text-on-surface">{inquiry.brand}</dd>
                      </div>
                    ) : null}
                    {inquiry.vin ? (
                      <div>
                        <dt className="text-on-surface-variant">{tx.fieldVin}</dt>
                        <dd className="text-on-surface">{inquiry.vin}</dd>
                      </div>
                    ) : null}
                    {inquiry.photoName ? (
                      <div>
                        <dt className="text-on-surface-variant">{tx.fieldPhoto}</dt>
                        <dd className="text-on-surface">{inquiry.photoName}</dd>
                      </div>
                    ) : null}
                    {inquiry.items.length > 0 ? (
                      <div className="sm:col-span-2">
                        <dt className="text-on-surface-variant">{tx.fieldParts}</dt>
                        <dd className="text-on-surface">
                          {inquiry.items.map((item) => `${item.partNumber} ×${item.qty}`).join("，")}
                        </dd>
                      </div>
                    ) : null}
                    {inquiry.message ? (
                      <div className="sm:col-span-2">
                        <dt className="text-on-surface-variant">{tx.fieldMessage}</dt>
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
                        <dt className="text-on-surface-variant">{tx.fieldNotes}</dt>
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
      </main>
    </SiteShell>
  );
}
