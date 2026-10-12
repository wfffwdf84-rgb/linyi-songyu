import { NextResponse, after } from "next/server";
import { inquiryStorageConfigured, rewriteInquiry, saveInquiry } from "@/lib/inquiry-store";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { toChinese } from "@/lib/translate";
import { readVisitorGeo } from "@/lib/visitor-geo";

function text(value: unknown, limit = 120) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, limit);
}

export async function POST(request: Request) {
  const limited = rateLimit(`inquiry:${clientIp(request)}`, 6, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "rate" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "body" }, { status: 400 });
  }

  // Honeypot: a real visitor never fills this hidden field.
  if (text(body.website)) return NextResponse.json({ ok: true, reference: "" });

  const contact = text(body.contact);
  const message = text(body.message, 2000);
  const types = Array.isArray(body.types)
    ? body.types.map((value) => text(value, 40)).filter(Boolean).slice(0, 8)
    : [];
  // The contact form sends inquiry types; the message box sends a message.
  // Either one is enough, but contact details are always required.
  if (!contact || (types.length === 0 && !message)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const items = Array.isArray(body.items)
    ? body.items
        .slice(0, 20)
        .map((raw) => {
          const item = (raw ?? {}) as Record<string, unknown>;
          const qty = Number(item.qty);
          return {
            partNumber: text(item.partNumber, 60),
            qty: Number.isFinite(qty) ? Math.max(1, Math.min(9999, Math.round(qty))) : 1,
          };
        })
        .filter((item) => item.partNumber)
    : [];

  if (!inquiryStorageConfigured()) {
    return NextResponse.json({ ok: false, error: "unconfigured" }, { status: 503 });
  }

  try {
    const geo = readVisitorGeo(request.headers);
    const { id, receivedAt, record } = await saveInquiry({
      locale: text(body.locale, 8),
      page: text(body.page, 200),
      types,
      urgent: body.urgent === true,
      company: text(body.company),
      contact,
      vin: text(body.vin, 60),
      brand: text(body.brand, 60),
      message,
      notes: text(body.notes, 2000),
      photoName: text(body.photoName, 200),
      ipCountry: geo.country,
      ipCity: geo.city,
      ipTimezone: geo.timezone,
      items,
    });

    // Render the lead in Chinese after responding, so the WhatsApp hand-off is
    // never delayed by a translation call. A failure just leaves the original.
    after(async () => {
      try {
        const [messageZh, notesZh] = await Promise.all([
          record.message ? toChinese(record.message) : Promise.resolve(""),
          record.notes ? toChinese(record.notes) : Promise.resolve(""),
        ]);
        if (!messageZh && !notesZh) return;
        await rewriteInquiry({
          ...record,
          ...(messageZh ? { messageZh } : {}),
          ...(notesZh ? { notesZh } : {}),
        });
      } catch (error) {
        console.error("inquiry translation failed", error);
      }
    });

    return NextResponse.json({
      ok: true,
      reference: id.slice(0, 8).toUpperCase(),
      receivedAt,
    });
  } catch (error) {
    console.error("inquiry save failed", error);
    return NextResponse.json({ ok: false, error: "save" }, { status: 500 });
  }
}
