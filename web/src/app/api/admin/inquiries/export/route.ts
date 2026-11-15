import { getAdminSession, requireRole } from "@/lib/admin-auth";
import { inquiryTimeLabel, inquiryTypesLabelZh } from "@/lib/inquiry-labels";
import { inquiryStorageConfigured, listInquiries, type StoredInquiry } from "@/lib/inquiry-store";
import { phoneCountry } from "@/lib/phone-country";
import { countryLabel } from "@/lib/visitor-geo";

export const dynamic = "force-dynamic";

const HEADER = [
  "时间",
  "国家",
  "城市",
  "语言",
  "公司",
  "联系方式",
  "电话归属国",
  "机型/品牌",
  "询盘类型",
  "留言原文",
  "留言中文",
  "是否紧急",
];

/**
 * A quoted cell with the visitor's own text inside it. Guarding the leading
 * character stops a message that starts with `=` from running as a formula
 * when the file is opened in Excel.
 */
function cell(value: string | undefined) {
  const text = value ?? "";
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
}

/** `US 美国` when the code is known, empty otherwise. */
function countryText(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return `${code} ${countryLabel(code, "zh")}`.trim();
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  // Owner, editor and sales may export; the role matrix has no read-only tier.
  if (!requireRole(session, ["owner", "editor", "sales"])) {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  if (!inquiryStorageConfigured()) {
    return Response.json({ ok: false, error: "unconfigured" }, { status: 503 });
  }

  let inquiries: StoredInquiry[];
  try {
    inquiries = await listInquiries();
  } catch (error) {
    console.error("inquiry export failed", error);
    return Response.json({ ok: false, error: "list" }, { status: 500 });
  }

  const lines = [HEADER.map((name) => cell(name)).join(",")];
  for (const inquiry of inquiries) {
    const ipCountry = (inquiry.ipCountry ?? "").toUpperCase();
    lines.push(
      [
        inquiryTimeLabel(inquiry.receivedAt),
        countryText(ipCountry),
        inquiry.ipCity ?? "",
        inquiry.locale ?? "",
        inquiry.company ?? "",
        inquiry.contact ?? "",
        countryText(phoneCountry(inquiry.contact ?? "")),
        inquiry.brand ?? "",
        inquiryTypesLabelZh(inquiry.types ?? []),
        inquiry.message ?? "",
        inquiry.messageZh ?? "",
        inquiry.urgent ? "是" : "否",
      ]
        .map((value) => cell(value))
        .join(","),
    );
  }

  const filename = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  // The BOM is what makes Excel read the file as UTF-8 instead of mojibake.
  return new Response(`\uFEFF${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
