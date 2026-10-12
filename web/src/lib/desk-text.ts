/**
 * The inquiry desk is an internal tool for the sales desk, so it carries its own
 * two-language wording instead of the site's 13 locale files: Chinese when the
 * URL carries /zh, English otherwise.
 */
export type DeskText = {
  metaTitle: string;
  title: string;
  newSuffix: string;
  capturedSuffix: string;
  signOut: string;
  signInLead: string;
  passwordLabel: string;
  open: string;
  checking: string;
  errorUnauthorized: string;
  errorRate: string;
  errorNotConfigured: string;
  errorNetwork: string;
  newChip: string;
  urgentChip: string;
  fieldTypes: string;
  fieldBrand: string;
  fieldVin: string;
  fieldPhoto: string;
  fieldParts: string;
  fieldMessage: string;
  fieldNotes: string;
  emptyTitle: string;
  emptyBody: string;
  missingStorage: string;
  unknown: string;
};

const EN: DeskText = {
  metaTitle: "Inquiry desk",
  title: "Inquiry desk",
  newSuffix: " new",
  capturedSuffix: " captured",
  signOut: "Sign out",
  signInLead: "Enter the factory password to read captured inquiries.",
  passwordLabel: "Password",
  open: "Open",
  checking: "Checking…",
  errorUnauthorized: "Wrong password.",
  errorRate: "Too many attempts. Try again later.",
  errorNotConfigured: "FACTORY_VIDEO_PASSWORD is not set on this deployment.",
  errorNetwork: "Network error.",
  newChip: "NEW",
  urgentChip: "URGENT",
  fieldTypes: "Types",
  fieldBrand: "Brand",
  fieldVin: "VIN",
  fieldPhoto: "Photo",
  fieldParts: "Parts",
  fieldMessage: "Message",
  fieldNotes: "Notes",
  emptyTitle: "No inquiries yet",
  emptyBody:
    "Every submission on the contact page is stored here from now on, including the ones that never reach WhatsApp.",
  missingStorage: "BLOB_READ_WRITE_TOKEN is not set on this deployment, so inquiries cannot be stored.",
  unknown: "?",
};

const ZH: DeskText = {
  metaTitle: "询盘后台",
  title: "询盘后台",
  newSuffix: " 条未读",
  capturedSuffix: " 条",
  signOut: "退出登录",
  signInLead: "输入密码即可查看收到的询盘。",
  passwordLabel: "密码",
  open: "进入",
  checking: "验证中…",
  errorUnauthorized: "密码错误。",
  errorRate: "尝试次数过多，请稍后再试。",
  errorNotConfigured: "服务器未设置 FACTORY_VIDEO_PASSWORD。",
  errorNetwork: "网络错误。",
  newChip: "新",
  urgentChip: "紧急",
  fieldTypes: "询盘类型",
  fieldBrand: "品牌",
  fieldVin: "车架号",
  fieldPhoto: "照片",
  fieldParts: "零件",
  fieldMessage: "留言内容",
  fieldNotes: "备注",
  emptyTitle: "还没有收到询盘",
  emptyBody: "从现在起，联系页上的每一次提交都会存在这里，包括没能发到 WhatsApp 的那些。",
  missingStorage: "服务器未配置 BLOB_READ_WRITE_TOKEN，无法存储询盘。",
  unknown: "未知",
};

export function deskText(locale: string): DeskText {
  return locale === "zh" ? ZH : EN;
}
