/**
 * The error codes the two copy endpoints return, in the operator's language.
 * Shared by the editor so a failure reads the same wherever it is shown.
 */
export const copyErrorMessages: Record<string, string> = {
  invalid_body: "提交的内容无法识别，请刷新页面后重试。",
  invalid_locale: "语言无效，请从下拉框里重新选择。",
  invalid_key: "有文案不在可编辑范围内：政策条款（服务条款 / 隐私 / 付款 / 运输）、SEO 与语言切换文案一律不允许修改。",
  unknown_key: "有文案在当前语言里不存在，无法覆盖（可能是语言包缺少该条目）。",
  invalid_value: "文案必须是文本。",
  too_long: "有文案超过 400 字上限，请缩短后再保存。",
  empty: "没有需要保存的内容。",
  too_many_entries: "一次提交的条目过多，请分几次保存。",
  invalid_target: "目标语言无效：翻译以中文为源，不能翻译成中文。",
  translate_failed: "翻译失败：免费翻译端点暂时不可用，请稍后重试或手动填写。",
  not_found: "该分组不存在，请刷新页面后重试。",
  not_configured: "服务器未配置 Supabase 存储，文案无法读取或保存。",
  unavailable: "保存失败：存储暂时不可用，请稍后重试。",
  unauthorized: "登录已过期，请重新登录。",
  forbidden: "需要所有者或运营权限。",
};

export function copyErrorText(code: string | undefined, detail?: string) {
  const base = copyErrorMessages[code ?? ""] ?? "操作失败，请稍后重试。";
  return detail ? `${base}（${detail}）` : base;
}
