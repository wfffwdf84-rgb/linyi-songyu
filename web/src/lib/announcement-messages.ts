/**
 * Chinese copy for the error codes the announcement API returns, shared by the
 * list row actions and the editor so the two cannot drift apart.
 */
export const announcementErrorMessages: Record<string, string> = {
  invalid_announcement: "提交的内容无法识别，请刷新页面后重试。",
  invalid_style: "样式无效，请从三种样式中选择一种。",
  invalid_text: "文案无效：英文必填，中英文各自不超过 200 字。",
  invalid_href: "链接无效：必须以 / 或 https:// 开头。",
  invalid_schedule: "时间无效：结束时间必须晚于开始时间（且不能相同）。",
  too_many_announcements: "公告数量已达上限（30 条），请先删除不再使用的公告。",
  not_found: "公告不存在，可能已被删除。",
  not_configured: "服务器未配置 Supabase 存储，无法保存公告。",
  unavailable: "保存失败：存储暂时不可用，请稍后重试。",
  unauthorized: "登录已过期，请重新登录。",
  forbidden: "需要所有者或运营权限。",
};

export function announcementErrorText(code: string | undefined) {
  return announcementErrorMessages[code ?? ""] ?? "操作失败，请稍后重试。";
}
