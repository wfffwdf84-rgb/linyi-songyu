"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { copyErrorText } from "@/lib/copy-messages";
import { COPY_VALUE_MAX } from "@/lib/copy-rules";
import { cn } from "@/lib/utils";

/**
 * The copy editor form.
 *
 * One language and one group at a time, because that is what the operator is
 * actually looking at: the panel edits "the current language's display", not a
 * global bundle. Switching either control is a server navigation, so unsaved
 * drafts are guarded by a confirm instead of being merged into the next view.
 *
 * Saving sends only the rows whose input differs from the value that was loaded.
 * The server diffs against the shipped copy once more, so a row typed back to the
 * original removes its override rather than pinning today's text.
 */

type EditorGroup = { id: string; label: string; hint: string; namespaces: string[] };
type EditorRow = { key: string; original: string; value: string; overridden: boolean };

type Notice = { tone: "ok" | "warn" | "error"; text: string };

type Props = {
  locale: string;
  groupId: string;
  groups: EditorGroup[];
  locales: { code: string; label: string }[];
  rows: EditorRow[];
  localeOverrideCount: number;
  status: "" | "not_configured" | "unreadable";
};

type SaveResponse = {
  ok?: boolean;
  error?: string;
  detail?: string;
  saved?: number;
  restored?: number;
  written?: boolean;
};

type TranslateResponse = {
  ok?: boolean;
  error?: string;
  detail?: string;
  translations?: Record<string, string>;
  failed?: string[];
  oversized?: string[];
  skipped?: string[];
};

const inputClass =
  "w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0";

function draftOf(rows: EditorRow[]) {
  const draft: Record<string, string> = {};
  for (const row of rows) draft[row.key] = row.value;
  return draft;
}

/** Up to five keys, so a warning stays readable. */
function keyList(keys: string[]) {
  if (keys.length === 0) return "";
  const head = keys.slice(0, 5).join("、");
  return keys.length > 5 ? `${head} 等 ${keys.length} 条` : head;
}

export function AdminCopyEditor({
  locale,
  groupId,
  groups,
  locales,
  rows,
  localeOverrideCount,
  status,
}: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => draftOf(rows));
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<"" | "save" | "restore" | "translate">("");
  const [notice, setNotice] = useState<Notice | null>(null);

  const group = groups.find((item) => item.id === groupId) ?? groups[0];
  const localeLabel = locales.find((item) => item.code === locale)?.label ?? locale;

  /**
   * After a save or a restore the server sends fresh rows; the drafts follow them.
   * The signature (not the array identity) decides, so an unrelated re-render
   * cannot wipe what is being typed.
   */
  const signature = useMemo(() => rows.map((row) => `${row.key}=${row.value}`).join("\u0001"), [rows]);
  const lastSignature = useRef(signature);
  useEffect(() => {
    if (lastSignature.current === signature) return;
    lastSignature.current = signature;
    setValues(draftOf(rows));
  }, [signature, rows]);

  const dirtyKeys = useMemo(
    () => rows.filter((row) => values[row.key] !== row.value).map((row) => row.key),
    [rows, values],
  );
  const dirty = dirtyKeys.length > 0;

  const needle = search.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!needle) return rows;
    return rows.filter(
      (row) =>
        row.key.toLowerCase().includes(needle) ||
        row.original.toLowerCase().includes(needle) ||
        (values[row.key] ?? "").toLowerCase().includes(needle),
    );
  }, [needle, rows, values]);

  // A closed tab is not a save. The browser only offers its generic prompt; the
  // confirm in navigate() is what covers the in-page switches.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const navigate = useCallback(
    (nextLocale: string, nextGroup: string) => {
      if (nextLocale === locale && nextGroup === groupId) return;
      if (dirty && !window.confirm("当前语言的修改还没保存，切换后会被丢弃。继续？")) return;
      const query = new URLSearchParams({ locale: nextLocale, group: nextGroup });
      router.push(`/admin/copy?${query.toString()}`);
    },
    [dirty, groupId, locale, router],
  );

  async function submit(entries: Record<string, string>, mode: "save" | "restore") {
    if (Object.keys(entries).length === 0) {
      setNotice({ tone: "warn", text: mode === "restore" ? "本组没有需要恢复的条目。" : "没有需要保存的修改。" });
      return;
    }
    setBusy(mode);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/copy", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, entries }),
      });
      const data = (await response.json().catch(() => null)) as SaveResponse | null;
      if (!response.ok || !data?.ok) {
        setNotice({ tone: "error", text: copyErrorText(data?.error, data?.detail) });
        return;
      }
      const restored = data.restored ?? 0;
      setNotice({
        tone: "ok",
        text:
          mode === "restore"
            ? restored > 0
              ? `已恢复 ${restored} 条为原始文案（${localeLabel}）。前台页面正在重新生成。`
              : `${localeLabel}：这些条目本来就是原始文案，无需恢复。`
            : `已保存（${localeLabel}）：当前共 ${data.saved ?? 0} 条覆盖生效，其中 ${restored} 条已恢复原文案。`,
      });
      router.refresh();
    } catch {
      setNotice({ tone: "error", text: "网络错误，保存失败。" });
    } finally {
      setBusy("");
    }
  }

  function onSave() {
    if (!dirty) {
      setNotice({ tone: "warn", text: "没有需要保存的修改。" });
      return;
    }
    const entries: Record<string, string> = {};
    for (const key of dirtyKeys) entries[key] = values[key] ?? "";
    void submit(entries, "save");
  }

  function onRestoreRow(row: EditorRow) {
    if (!row.overridden && !dirtyKeys.includes(row.key)) {
      setNotice({ tone: "warn", text: "该条已经是原始文案。" });
      return;
    }
    void submit({ [row.key]: row.original }, "restore");
  }

  function onRestoreGroup() {
    const entries: Record<string, string> = {};
    for (const row of rows) {
      if (row.overridden || dirtyKeys.includes(row.key)) entries[row.key] = row.original;
    }
    if (Object.keys(entries).length === 0) {
      setNotice({ tone: "warn", text: "本组没有需要恢复的条目。" });
      return;
    }
    if (!window.confirm(`把本组 ${Object.keys(entries).length} 条全部恢复为原始文案？该语言的这些覆盖会被删除。`)) {
      return;
    }
    void submit(entries, "restore");
  }

  async function onTranslate() {
    if (locale === "zh") {
      setNotice({
        tone: "warn",
        text: "翻译以中文为源：请先在顶部切换到要翻译成的语言，再点「从中文重新翻译」。",
      });
      return;
    }
    if (dirty && !window.confirm("本组有未保存的修改，重新翻译会覆盖输入框里的内容。继续？")) return;

    setBusy("translate");
    setNotice(null);
    try {
      const response = await fetch("/api/admin/copy/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, group: groupId }),
      });
      const data = (await response.json().catch(() => null)) as TranslateResponse | null;
      if (!response.ok || !data?.ok) {
        setNotice({ tone: "error", text: copyErrorText(data?.error, data?.detail) });
        return;
      }
      const translations = data.translations ?? {};
      const count = Object.keys(translations).length;
      setValues((current) => ({ ...current, ...translations }));

      const problems: string[] = [];
      if (data.failed?.length) problems.push(`${data.failed.length} 条翻译失败（未填写，保持原值）：${keyList(data.failed)}`);
      if (data.oversized?.length) problems.push(`${data.oversized.length} 条译文超过 ${COPY_VALUE_MAX} 字已被截断，请手动精简：${keyList(data.oversized)}`);
      if (data.skipped?.length) problems.push(`${data.skipped.length} 条缺少中文原文，未翻译：${keyList(data.skipped)}`);

      setNotice({
        tone: problems.length ? "warn" : "ok",
        text: [
          `已把 ${count} 条中文文案翻译成${localeLabel}并填入输入框，还没有保存——请逐条检查，确认后点「保存修改」。`,
          ...problems,
        ].join(" "),
      });
    } catch {
      setNotice({ tone: "error", text: "网络错误，翻译失败。" });
    } finally {
      setBusy("");
    }
  }

  const overrideCount = rows.filter((row) => row.overridden).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
            <MaterialIcon name="edit_note" className="text-primary" />
            网站文案
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            当前编辑：<b className="text-on-surface">{localeLabel}</b> · {group.label} · 共 {rows.length} 条，
            其中 {overrideCount} 条已修改；该语言全站共 {localeOverrideCount} 条覆盖。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            语言
            <select
              value={locale}
              onChange={(event) => navigate(event.target.value, groupId)}
              className="rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary"
            >
              {locales.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                  {item.code === "zh" ? "（源语言）" : ""}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void onTranslate()}
            disabled={busy !== "" || locale === "zh"}
            title={locale === "zh" ? "翻译以中文为源，请先切换到目标语言" : "把本组中文文案翻译成当前语言"}
            className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-body-md text-primary hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MaterialIcon name="translate" className="text-[18px]" />
            {busy === "translate" ? "翻译中…" : "从中文重新翻译"}
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
        <MaterialIcon name="info" className="text-[18px] text-primary" />
        <div className="space-y-1">
          <p>
            改的是<b className="text-on-surface">「{localeLabel}」这一种语言</b>的显示，其它语言不受影响。
            13 种语言要分别确认：建议先改好中文，再切到每种语言点「从中文重新翻译」，逐条检查后保存。
          </p>
          <p>
            只能改首页、关于、联系、品质与物流、页脚、导航与按钮这几组文案。服务条款 / 隐私 / 付款 / 运输等政策
            条款与 SEO 文案不在可编辑范围内，服务端会直接拒绝。单条上限 {COPY_VALUE_MAX} 字。
          </p>
          <p>把某条改回原文案再保存，等于删除这条覆盖，前台立即回到代码里的原文案。</p>
        </div>
      </div>

      {status === "not_configured" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          服务器未配置 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY，文案覆盖无法读取与保存。前台此时显示代码里的原文案。
        </p>
      ) : null}
      {status === "unreadable" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          覆盖文档无法读取（数据库不可用，或内容损坏）。前台此时显示原文案；为避免覆盖已有修改，请在存储恢复后再保存。
        </p>
      ) : null}

      <div className="flex flex-wrap gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-2">
        {groups.map((item) => {
          const active = item.id === groupId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(locale, item.id)}
              aria-pressed={active}
              className={cn(
                "rounded-lg px-3 py-1.5 text-body-md",
                active
                  ? "bg-primary font-semibold text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <p className="text-body-sm text-on-surface-variant">{group.hint}</p>

      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-3">
        <label className="flex min-w-[16rem] flex-1 items-center gap-2">
          <MaterialIcon name="search" className="text-[18px] text-on-surface-variant" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索 key 或文案内容"
            className="w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0"
          />
        </label>
        <span className="text-body-sm text-on-surface-variant">
          {needle ? `筛选出 ${visible.length} / ${rows.length} 条` : `共 ${rows.length} 条`}
          {dirty ? ` · 未保存 ${dirtyKeys.length} 条` : ""}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={busy !== "" || !dirty}
            className="rounded-lg bg-primary px-4 py-2 text-body-md font-semibold text-on-primary disabled:opacity-60"
          >
            {busy === "save" ? "保存中…" : "保存修改"}
          </button>
          <button
            type="button"
            onClick={() => void onRestoreGroup()}
            disabled={busy !== ""}
            className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-body-md text-on-surface-variant hover:border-primary disabled:opacity-60"
          >
            <MaterialIcon name="restart_alt" className="text-[18px]" />
            恢复本组原始
          </button>
          <button
            type="button"
            onClick={() => {
              if (dirty && !window.confirm("当前修改还没保存，重新载入会丢弃它们。继续？")) return;
              setValues(draftOf(rows));
              setNotice(null);
              router.refresh();
            }}
            disabled={busy !== ""}
            className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-body-md text-on-surface-variant hover:border-primary disabled:opacity-60"
          >
            <MaterialIcon name="undo" className="text-[18px]" />
            放弃修改
          </button>
        </div>
      </div>

      {notice ? (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={cn(
            "rounded-xl border p-4 text-body-md",
            notice.tone === "error"
              ? "border-error bg-error-container text-on-error-container"
              : notice.tone === "warn"
                ? "border-outline bg-secondary-container text-on-secondary-container"
                : "border-outline-variant bg-surface-container text-on-surface",
          )}
        >
          {notice.text}
        </p>
      ) : null}

      <ul className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        {visible.length === 0 ? (
          <li className="px-4 py-8 text-body-md text-on-surface-variant">
            没有匹配的文案。换个关键词，或清空搜索框。
          </li>
        ) : (
          visible.map((row) => {
            const draft = values[row.key] ?? row.original;
            const isDirty = values[row.key] !== undefined && values[row.key] !== row.value;
            const showOriginal = row.overridden || isDirty;
            return (
              <li key={row.key} className="border-b border-outline-variant px-4 py-3 last:border-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <code className="text-technical-data text-on-surface-variant/80">{row.key}</code>
                  {row.overridden ? (
                    <span className="rounded bg-primary-fixed px-2 py-0.5 text-label-caps text-on-primary-fixed">
                      已修改
                    </span>
                  ) : (
                    <span className="rounded bg-surface-container px-2 py-0.5 text-label-caps text-on-surface-variant">
                      原始
                    </span>
                  )}
                  {isDirty ? (
                    <span className="rounded bg-secondary-container px-2 py-0.5 text-label-caps text-on-secondary-container">
                      未保存
                    </span>
                  ) : null}
                  <span className="ms-auto text-technical-data text-on-surface-variant/70">
                    {draft.length} / {COPY_VALUE_MAX}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRestoreRow(row)}
                    disabled={busy !== "" || (!row.overridden && !isDirty)}
                    className="inline-flex items-center gap-1 rounded border border-outline-variant px-2 py-0.5 text-technical-data text-primary hover:border-primary disabled:opacity-40"
                  >
                    <MaterialIcon name="restore" className="text-[14px]" />
                    恢复原始
                  </button>
                </div>
                <textarea
                  value={draft}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [row.key]: event.target.value }))
                  }
                  maxLength={COPY_VALUE_MAX}
                  rows={draft.length > 120 ? 3 : 2}
                  aria-label={`文案 ${row.key}`}
                  className={inputClass}
                />
                {showOriginal ? (
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    原始：<span className="text-on-surface-variant/80">{row.original}</span>
                  </p>
                ) : null}
              </li>
            );
          })
        )}
      </ul>

      <p className="text-body-sm text-on-surface-variant">
        保存后前台所有页面会重新生成，CDN 可能需要一点时间。覆盖文档为明文 JSON（
        <code className="text-technical-data">content/copy-overrides.json</code>），读不到时站点自动使用原文案。
      </p>
    </div>
  );
}
