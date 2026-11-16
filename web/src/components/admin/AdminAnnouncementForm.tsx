"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnnouncementBarView } from "@/components/layout/AnnouncementBarView";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { announcementErrorText } from "@/lib/announcement-messages";
import {
  ANNOUNCEMENT_TEXT_MAX,
  announcementStyles,
  type Announcement,
  type AnnouncementStyle,
} from "@/lib/announcement-rules";
import {
  announcementStyleHints,
  announcementStyleLabels,
} from "@/lib/announcement-styles";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0";

/** `2026-11-16T13:05` in the operator's own timezone, which is what the input shows. */
function toLocalInput(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** Back to UTC ISO; an empty input clears the bound. */
function fromLocalInput(value: string) {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/** Only a value the API would accept is worth previewing as a link. */
function previewHref(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return undefined;
  if (cleaned.startsWith("https://")) return cleaned;
  if (cleaned.startsWith("/") && !cleaned.startsWith("//")) return cleaned;
  return undefined;
}

export function AdminAnnouncementForm({
  announcement,
  otherActiveCount,
}: {
  /** null on the create page. */
  announcement: Announcement | null;
  /** Enabled announcements other than this one; drives the "keep only one" warning. */
  otherActiveCount: number;
}) {
  const router = useRouter();
  const [style, setStyle] = useState<AnnouncementStyle>(announcement?.style ?? "info");
  const [textEn, setTextEn] = useState(announcement?.text.en ?? "");
  const [textZh, setTextZh] = useState(announcement?.text.zh ?? "");
  const [href, setHref] = useState(announcement?.href ?? "");
  const [startAt, setStartAt] = useState(toLocalInput(announcement?.startAt));
  const [endAt, setEndAt] = useState(toLocalInput(announcement?.endAt));
  const [dismissible, setDismissible] = useState(announcement?.dismissible ?? true);
  const [active, setActive] = useState(announcement?.active ?? false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const previewText = textZh.trim() || textEn.trim() || "公告文案预览";
  const wouldBeActive = active && otherActiveCount > 0;

  async function onSave() {
    setError("");
    setSaved("");

    if (!textEn.trim()) {
      setError("英文文案必填：其它 12 种语言缺少译文时都会回退到英文。");
      return;
    }
    const startIso = fromLocalInput(startAt);
    const endIso = fromLocalInput(endAt);
    if (startIso && endIso && Date.parse(startIso) >= Date.parse(endIso)) {
      setError("结束时间必须晚于开始时间（也不能相同）。");
      return;
    }

    const payload = {
      style,
      text: { en: textEn, zh: textZh },
      href: href.trim() || null,
      startAt: startIso,
      endAt: endIso,
      dismissible,
      active,
    };

    setBusy(true);
    try {
      const response = announcement
        ? await fetch("/api/admin/announcements", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: announcement.id, patch: payload }),
          })
        : await fetch("/api/admin/announcements", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; announcement?: { id?: string } }
        | null;
      if (!response.ok || !data?.ok) {
        setError(announcementErrorText(data?.error));
        return;
      }
      if (!announcement) {
        const id = data.announcement?.id;
        router.push(id ? `/admin/announcements/${id}` : "/admin/announcements");
      } else {
        setSaved("已保存，前台所有页面正在重新生成。");
      }
      router.refresh();
    } catch {
      setError("网络错误，保存失败。");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!announcement) return;
    if (!window.confirm(`删除公告「${textZh.trim() || textEn.trim()}」？删除后前台立即不再显示，且无法撤销。`)) {
      return;
    }
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const response = await fetch(
        `/api/admin/announcements?id=${encodeURIComponent(announcement.id)}`,
        { method: "DELETE" },
      );
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!response.ok || !data?.ok) {
        setError(announcementErrorText(data?.error));
        return;
      }
      router.push("/admin/announcements");
      router.refresh();
    } catch {
      setError("网络错误，删除失败。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="edit_note" className="text-primary" />
          文案与样式
        </h2>
        <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container p-3 text-body-sm text-on-surface-variant">
          只有中文和英文两套文案：中文站点用中文（留空则回退英文），其它 12 种语言一律显示英文。
          单条公告两行以内，超出部分在手机上会被截断。
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <label className="block space-y-1 lg:col-span-2">
            <span className="block text-technical-data text-on-surface-variant">样式</span>
            <span className="flex flex-wrap gap-2">
              {announcementStyles.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStyle(value)}
                  aria-pressed={style === value}
                  className={cn(
                    "flex items-center gap-2 rounded-full border-2 px-3 py-1 text-technical-data",
                    style === value
                      ? "border-primary bg-primary-fixed text-on-primary-fixed"
                      : "border-outline-variant text-on-surface-variant hover:border-primary",
                  )}
                >
                  {announcementStyleLabels[value]}
                </button>
              ))}
            </span>
            <span className="block text-body-sm text-on-surface-variant">
              {announcementStyleHints[style]}
            </span>
          </label>

          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">
              英文文案（必填，≤{ANNOUNCEMENT_TEXT_MAX} 字）
            </span>
            <textarea
              value={textEn}
              onChange={(event) => setTextEn(event.target.value)}
              maxLength={ANNOUNCEMENT_TEXT_MAX}
              rows={2}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">
              中文文案（≤{ANNOUNCEMENT_TEXT_MAX} 字，留空则显示英文）
            </span>
            <textarea
              value={textZh}
              onChange={(event) => setTextZh(event.target.value)}
              maxLength={ANNOUNCEMENT_TEXT_MAX}
              rows={2}
              className={inputClass}
            />
          </label>

          <label className="block space-y-1 lg:col-span-2">
            <span className="block text-technical-data text-on-surface-variant">
              链接（可选：站内路径如 /parts，或 https:// 开头的外链）
            </span>
            <input
              value={href}
              onChange={(event) => setHref(event.target.value)}
              placeholder="/parts  或  https://..."
              spellCheck={false}
              className={inputClass}
            />
            <span className="block text-body-sm text-on-surface-variant">
              站内路径会自动带上当前语言前缀；外链在新标签页打开。留空则公告不可点击。
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="campaign" className="text-primary" />
          实时预览
        </h2>
        <p className="mb-4 text-body-sm text-on-surface-variant">
          按中文站点渲染；中文留空时显示英文。关闭按钮只有勾选「可关闭」时才出现。
        </p>
        <AnnouncementBarView
          style={style}
          text={previewText}
          href={previewHref(href)}
          locale="zh"
          dismissible={dismissible}
        />
        <p className="mt-2 text-body-sm text-on-surface-variant">
          实际宽度与页面一致，手机端最多两行。
        </p>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="schedule" className="text-primary" />
          展示时间
        </h2>
        <p className="mb-4 text-body-sm text-on-surface-variant">
          按你所在时区填写，留空表示不限。时间窗是左闭右开：开始时刻起显示，结束时刻起不再显示。
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">开始时间（可选）</span>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">结束时间（可选）</span>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(event) => setEndAt(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="toggle_on" className="text-primary" />
          开关
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
          <label className="flex items-center gap-2 text-body-md text-on-surface">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            启用（前台显示）
          </label>
          <label className="flex items-center gap-2 text-body-md text-on-surface">
            <input
              type="checkbox"
              checked={dismissible}
              onChange={(event) => setDismissible(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            可关闭（显示 ✕，访客关闭后不再出现）
          </label>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-outline bg-secondary-container p-3 text-body-sm text-on-secondary-container">
          <MaterialIcon name="info" className="text-[18px]" />
          <span>
            <b>请只保留一条启用。</b>前台只显示一条公告：启用、当前在时间窗内、创建时间最新的那条。
            同时启用多条时系统不会轮播，其余只是被忽略。
          </span>
        </div>
        {wouldBeActive ? (
          <p
            role="alert"
            className="mt-2 flex items-start gap-2 rounded-lg border border-outline bg-primary-fixed p-3 text-body-sm text-on-primary-fixed"
          >
            <MaterialIcon name="warning" className="text-[18px]" />
            <span>
              目前已有 {otherActiveCount} 条其它公告处于启用状态。保存后共 {otherActiveCount + 1} 条启用，
              前台仍然只会显示其中创建时间最新的一条。
            </span>
          </p>
        ) : null}
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container"
        >
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="rounded-xl border border-outline-variant bg-secondary-container p-4 text-body-md text-on-secondary-container">
          {saved}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={busy}
          className="rounded-xl bg-primary px-5 py-2 text-body-md font-semibold text-on-primary disabled:opacity-60"
        >
          {busy ? "保存中…" : "保存"}
        </button>
        {announcement ? (
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-xl border border-error px-4 py-2 text-body-md text-error hover:bg-error-container disabled:opacity-60"
          >
            <MaterialIcon name="delete" className="text-[18px]" />
            删除该公告
          </button>
        ) : null}
        <span className="text-body-sm text-on-surface-variant">
          {active ? "保存后前台将显示（若在时间窗内）" : "当前为停用状态，保存后前台不显示"}
        </span>
      </div>
    </div>
  );
}
