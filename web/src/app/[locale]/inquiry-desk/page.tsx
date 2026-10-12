import type { Metadata } from "next";
import { cookies } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/components/layout/SiteShell";
import { InquiryDeskLogin } from "@/components/admin/InquiryDeskLogin";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { InquiryDeskLogout } from "@/components/admin/InquiryDeskLogout";
import { isInquiryDeskAuthed } from "@/lib/inquiry-auth";
import { inquiryStorageConfigured, listInquiries } from "@/lib/inquiry-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inquiry desk",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ locale: string }>;
};

/** Digits only, so a stored "+86 175 6815 5882" still opens a WhatsApp chat. */
function whatsappHref(contact: string) {
  const digits = contact.replace(/\D/g, "");
  return digits.length >= 6 ? `https://wa.me/${digits}` : "";
}

export default async function InquiryDeskPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const jar = await cookies();
  if (!isInquiryDeskAuthed(jar.toString())) {
    return (
      <SiteShell>
        <main className="mx-auto w-full max-w-container-max px-margin-mobile py-10 md:px-margin-desktop">
          <InquiryDeskLogin />
        </main>
      </SiteShell>
    );
  }

  const configured = inquiryStorageConfigured();
  const inquiries = configured ? await listInquiries() : [];

  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-container-max px-margin-mobile py-10 md:px-margin-desktop">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="flex items-center gap-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
            <MaterialIcon name="inbox" className="text-primary" />
            Inquiry desk
          </h1>
          <div className="flex items-center gap-3 text-technical-data">
            <span className="rounded bg-surface-container px-3 py-1 text-on-surface-variant">
              {inquiries.length} captured
            </span>
            <InquiryDeskLogout />
          </div>
        </div>

        {!configured ? (
          <p className="rounded-xl border border-error bg-error-container p-6 text-body-md text-on-error-container">
            BLOB_READ_WRITE_TOKEN is not set on this deployment, so inquiries cannot be stored.
          </p>
        ) : inquiries.length === 0 ? (
          <p className="rounded-xl border border-outline-variant bg-surface-container-low p-6 text-body-md text-on-surface-variant">
            No inquiries captured yet. Every submission on the contact page is stored here from now on,
            including the ones that never reach WhatsApp.
          </p>
        ) : (
          <ul className="space-y-4">
            {inquiries.map((inquiry) => {
              const wa = whatsappHref(inquiry.contact);
              return (
                <li
                  key={inquiry.id}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {inquiry.urgent ? (
                      <span className="rounded bg-error px-2 py-0.5 text-label-caps text-on-error">
                        URGENT
                      </span>
                    ) : null}
                    <span className="rounded bg-surface-container px-2 py-0.5 text-technical-data text-on-surface-variant">
                      {inquiry.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-technical-data text-on-surface-variant">
                      {new Date(inquiry.receivedAt).toUTCString()}
                    </span>
                    <span className="text-technical-data text-on-surface-variant">
                      {inquiry.locale || "?"} · {inquiry.page || "?"}
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
                    <div>
                      <dt className="text-on-surface-variant">Types</dt>
                      <dd className="text-on-surface">{inquiry.types.join(", ")}</dd>
                    </div>
                    {inquiry.brand ? (
                      <div>
                        <dt className="text-on-surface-variant">Brand</dt>
                        <dd className="text-on-surface">{inquiry.brand}</dd>
                      </div>
                    ) : null}
                    {inquiry.vin ? (
                      <div>
                        <dt className="text-on-surface-variant">VIN</dt>
                        <dd className="text-on-surface">{inquiry.vin}</dd>
                      </div>
                    ) : null}
                    {inquiry.photoName ? (
                      <div>
                        <dt className="text-on-surface-variant">Photo</dt>
                        <dd className="text-on-surface">{inquiry.photoName}</dd>
                      </div>
                    ) : null}
                    {inquiry.items.length > 0 ? (
                      <div className="sm:col-span-2">
                        <dt className="text-on-surface-variant">Parts</dt>
                        <dd className="text-on-surface">
                          {inquiry.items.map((item) => `${item.partNumber} x${item.qty}`).join(", ")}
                        </dd>
                      </div>
                    ) : null}
                    {inquiry.message ? (
                      <div className="sm:col-span-2">
                        <dt className="text-on-surface-variant">Message</dt>
                        <dd className="whitespace-pre-wrap text-on-surface">{inquiry.message}</dd>
                      </div>
                    ) : null}
                    {inquiry.notes ? (
                      <div className="sm:col-span-2">
                        <dt className="text-on-surface-variant">Notes</dt>
                        <dd className="whitespace-pre-wrap text-on-surface">{inquiry.notes}</dd>
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
