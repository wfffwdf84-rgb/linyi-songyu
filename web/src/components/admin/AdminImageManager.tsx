"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { SITE_IMAGE_ITEMS_MAX } from "@/lib/site-image-slots";
import { cn } from "@/lib/utils";

/**
 * The image manager.
 *
 * One card per slot, grouped by the page the image appears on. A slot is either
 * a single photo (upload replaces, restore reverts) or a carousel (add, reorder,
 * delete, restore). Nothing is saved by the file picker alone: an upload only
 * produces a URL, and the URL is then written to the slot, so a failed write
 * never leaves a half-replaced page.
 *
 * The component talks to the two admin routes and keeps a local copy of the
 * current values so a reorder or a delete the operator just made is visible
 * immediately; `router.refresh()` then re-reads the server truth (the
 * "默认 / 已替换" badges) without losing a draft, because there is no draft here.
 */

export type AdminImageSlotView = {
  id: string;
  label: string;
  kind: "single" | "carousel";
  where: string;
  hint: string;
  /** Effective URLs: the override or the shipped files. */
  value: string[];
  /** The shipped files, for "恢复默认" and for the badge. */
  defaults: string[];
  overridden: boolean;
};

/**
 * The hero carousel settings, attached to the group they apply to. The bounds
 * come from the shared rules module so the panel cannot drift from the API.
 */
export type AdminHeroSettingsView = {
  /** Effective values, defaults already resolved. */
  intervalMs: number;
  autoplay: boolean;
  defaultIntervalMs: number;
  minIntervalMs: number;
  maxIntervalMs: number;
  stepIntervalMs: number;
};

export type AdminImageGroupView = {
  id: string;
  label: string;
  pagePath: string;
  hint: string;
  /** Present on the group that owns the hero carousel (首页). */
  heroSettings?: AdminHeroSettingsView;
  slots: AdminImageSlotView[];
};

type Props = {
  groups: AdminImageGroupView[];
  status: "" | "not_configured" | "unreadable";
};

type Notice = { tone: "ok" | "warn" | "error"; text: string };

type SaveResponse = {
  ok?: boolean;
  error?: string;
  detail?: string;
  slotId?: string;
  value?: string | string[];
  restored?: boolean;
  written?: boolean;
  settings?: { heroIntervalMs: number; heroAutoplay: boolean };
};

const ERROR_TEXT: Record<string, string> = {
  too_large: "文件超过 5 MB，请先压缩。",
  unsupported_type: "只支持 JPEG / PNG / WebP，且文件内容必须与扩展名一致。",
  no_file: "请选择一张图片。",
  invalid_body: "上传内容无法识别，请重试。",
  invalid_slot: "图片位不存在，请刷新页面后再试。",
  invalid_value: "图片地址不合法。",
  invalid_interval: "切换间隔必须是 2 ~ 15 秒之间的整数毫秒。",
  invalid_autoplay: "自动播放的取值不合法。",
  too_many: `一个轮播最多 ${SITE_IMAGE_ITEMS_MAX} 张。`,
  not_configured: "服务器未配置 Supabase 存储，无法上传或保存。",
  upload_failed: "上传失败，请稍后重试。",
  unavailable: "存储暂时不可用，请稍后重试。",
  unauthorized: "登录已过期，请重新登录。",
  forbidden: "需要所有者或运营权限。",
};

function errorText(code: string | undefined) {
  return ERROR_TEXT[code ?? ""] ?? "操作失败，请稍后重试。";
}

/** Busy marker for the settings form; no slot id can collide with it. */
const HERO_BUSY = "hero-settings";

/** Milliseconds as the seconds string the number input edits. */
function secondsFrom(ms: number) {
  return String(ms / 1000);
}

function initialValues(groups: AdminImageGroupView[]) {
  const values: Record<string, string[]> = {};
  for (const group of groups) {
    for (const slot of group.slots) values[slot.id] = slot.value;
  }
  return values;
}

function signatureOf(groups: AdminImageGroupView[]) {
  return groups
    .flatMap((group) => [
      // The hero settings are part of the signature so a server refresh after a
      // save also resyncs the settings draft, exactly like the image values.
      `${group.id}|${group.heroSettings ? `${group.heroSettings.intervalMs}/${group.heroSettings.autoplay}` : "-"}`,
      ...group.slots.map((slot) => `${slot.id}|${slot.overridden}|${slot.value.join(",")}`),
    ])
    .join("\u0001");
}

export function AdminImageManager({ groups, status }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string[]>>(() => initialValues(groups));
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);

  const heroSettings = groups.find((group) => group.heroSettings)?.heroSettings;
  const [heroSeconds, setHeroSeconds] = useState(() =>
    secondsFrom(heroSettings?.intervalMs ?? heroSettings?.defaultIntervalMs ?? 3000),
  );
  const [heroAutoplay, setHeroAutoplay] = useState(() => heroSettings?.autoplay ?? true);

  // After a save the server sends fresh slot values; the signature (not the
  // array identity) decides, so an unrelated re-render cannot wipe a local edit.
  // The hero settings form keeps its own draft: it is written by its own request
  // and re-read on the next full page load, so a refresh here must not overwrite
  // what the operator just typed.
  const signature = useMemo(() => signatureOf(groups), [groups]);
  const lastSignature = useRef(signature);
  useEffect(() => {
    if (lastSignature.current === signature) return;
    lastSignature.current = signature;
    setValues(initialValues(groups));
  }, [signature, groups]);

  const slotCount = groups.reduce((total, group) => total + group.slots.length, 0);

  async function save(slotId: string, next: string[], successText: string) {
    setBusy(slotId);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/images", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slotId, value: next }),
      });
      const data = (await response.json().catch(() => null)) as SaveResponse | null;
      if (!response.ok || !data?.ok) {
        setNotice({ tone: "error", text: errorText(data?.error) });
        return;
      }
      const stored = data.value;
      const asList = Array.isArray(stored) ? stored : typeof stored === "string" && stored ? [stored] : [];
      setValues((current) => ({ ...current, [slotId]: asList }));
      setNotice({ tone: "ok", text: successText });
      router.refresh();
    } catch {
      setNotice({ tone: "error", text: "网络错误，操作没有保存。" });
    } finally {
      setBusy("");
    }
  }

  /**
   * Saves the hero cadence and autoplay switch. The bounds are checked here too,
   * so a typo is answered at once instead of after a round trip - the API checks
   * them again, because this panel is only a convenience.
   */
  async function saveHeroSettings() {
    if (!heroSettings) return;
    const seconds = Number(heroSeconds);
    const intervalMs = Math.round(seconds * 1000);
    if (
      heroSeconds.trim() === "" ||
      !Number.isFinite(seconds) ||
      intervalMs < heroSettings.minIntervalMs ||
      intervalMs > heroSettings.maxIntervalMs
    ) {
      setNotice({
        tone: "error",
        text: `切换间隔需要在 ${heroSettings.minIntervalMs / 1000} ~ ${heroSettings.maxIntervalMs / 1000} 秒之间。`,
      });
      return;
    }
    setBusy(HERO_BUSY);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/images", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ settings: { heroIntervalMs: intervalMs, heroAutoplay } }),
      });
      const data = (await response.json().catch(() => null)) as SaveResponse | null;
      if (!response.ok || !data?.ok) {
        setNotice({ tone: "error", text: errorText(data?.error) });
        return;
      }
      const stored = data.settings;
      if (stored) {
        setHeroSeconds(secondsFrom(stored.heroIntervalMs));
        setHeroAutoplay(stored.heroAutoplay);
        setNotice({
          tone: "ok",
          text: `轮播设置已保存：每 ${secondsFrom(stored.heroIntervalMs)} 秒切换，自动播放${
            stored.heroAutoplay ? "开启" : "关闭"
          }。`,
        });
      } else {
        setNotice({ tone: "ok", text: "轮播设置已保存。" });
      }
      router.refresh();
    } catch {
      setNotice({ tone: "error", text: "网络错误，设置没有保存。" });
    } finally {
      setBusy("");
    }
  }

  async function upload(slotId: string, file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setNotice({ tone: "error", text: errorText("too_large") });
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setNotice({ tone: "error", text: errorText("unsupported_type") });
      return;
    }
    setBusy(slotId);
    setNotice(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("slot", slotId);
      const response = await fetch("/api/admin/images/upload", { method: "POST", body: form });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; url?: string; error?: string }
        | null;
      if (!response.ok || !data?.ok || !data.url) {
        setNotice({ tone: "error", text: errorText(data?.error) });
        return;
      }
      const url = data.url;
      const current = values[slotId] ?? [];
      const slot = groups.flatMap((group) => group.slots).find((item) => item.id === slotId);
      const next = slot?.kind === "carousel" ? [...current, url] : [url];
      await save(slotId, next, slot?.kind === "carousel" ? "已上传并加到轮播末尾。" : "已上传并替换。");
    } catch {
      setNotice({ tone: "error", text: "网络错误，上传失败。" });
    } finally {
      setBusy("");
    }
  }

  function move(slotId: string, index: number, direction: -1 | 1) {
    const current = [...(values[slotId] ?? [])];
    const target = index + direction;
    if (target < 0 || target >= current.length) return;
    [current[index], current[target]] = [current[target], current[index]];
    void save(slotId, current, direction < 0 ? "已上移一张。" : "已下移一张。");
  }

  function remove(slotId: string, index: number) {
    const current = (values[slotId] ?? []).filter((_, position) => position !== index);
    const text =
      current.length === 0
        ? "已删除最后一张，这个轮播回到默认图。"
        : "已删除这一张。";
    if (current.length === 0 && !window.confirm("这是最后一张，删除后轮播会回到默认图。继续？")) return;
    void save(slotId, current, text);
  }

  function restore(slotId: string) {
    if (!window.confirm("把这一处的图片恢复为站点默认图？已上传的替换会被删除（上传的文件本身仍留在存储里）。")) return;
    void save(slotId, [], "已恢复默认图。");
  }

  const busyStyle = (slotId: string) => busy === slotId;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
            <MaterialIcon name="image" className="text-primary" />
            网站图片
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            共 {slotCount} 处可替换的图片位。这里只改网站装饰图（首屏、工厂、质检、logo），
            产品照片请到「产品」里改。
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
        <MaterialIcon name="info" className="text-[18px] text-primary" />
        <div className="space-y-1">
          <p>
            上传只接受 <b className="text-on-surface">JPEG / PNG / WebP，单张 ≤ 5 MB</b>
            ，服务端会按文件头再校验一次；上传后先得到一个网址，再写入这个图片位。
          </p>
          <p>
            保存后前台所有页面会重新生成，CDN 可能还需要一点时间。「恢复默认」删的是替换记录，
            不是存储里的文件。
          </p>
          <p>
            图片位清单写在代码里（
            <code className="text-technical-data">src/lib/site-image-slots.ts</code>
            ）：新增一处图片要先在那里登记，面板才会出现。
          </p>
        </div>
      </div>

      {status === "not_configured" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          服务器未配置 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY，图片覆盖无法读取与保存。前台此时显示站点默认图。
        </p>
      ) : null}
      {status === "unreadable" ? (
        <p className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container">
          图片文档无法读取（数据库不可用，或内容损坏）。前台此时显示默认图；为避免覆盖已有替换，
          请在存储恢复后再保存。
        </p>
      ) : null}

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

      {groups.map((group) => (
        <section key={group.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant p-4">
            <div>
              <h2 className="text-headline-md text-on-surface">{group.label}</h2>
              <p className="mt-1 text-body-sm text-on-surface-variant">{group.hint}</p>
            </div>
            <a
              href={group.pagePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-body-sm text-primary hover:underline"
            >
              <MaterialIcon name="open_in_new" className="text-[16px]" />
              查看这个页面
            </a>
          </header>

          <ul className="divide-y divide-outline-variant">
            {group.slots.map((slot) => {
              const current = values[slot.id] ?? slot.value;
              const slotBusy = busyStyle(slot.id);
              const label = slot.kind === "carousel" ? `${slot.label}（${current.length} 张）` : slot.label;
              return (
                <li key={slot.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-body-lg font-semibold text-on-surface">{label}</h3>
                        {slot.overridden ? (
                          <span className="rounded bg-primary-fixed px-2 py-0.5 text-label-caps text-on-primary-fixed">
                            已替换
                          </span>
                        ) : (
                          <span className="rounded bg-surface-container px-2 py-0.5 text-label-caps text-on-surface-variant">
                            默认
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-body-sm text-on-surface-variant">{slot.where}</p>
                      <p className="mt-0.5 text-technical-data text-on-surface-variant/70">{slot.hint}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1 rounded-lg bg-primary px-3 py-2 text-body-md font-semibold text-on-primary",
                          slotBusy && "pointer-events-none opacity-60",
                        )}
                      >
                        <MaterialIcon name="upload" className="text-[18px]" />
                        {slotBusy ? "处理中…" : slot.kind === "carousel" ? "上传新增" : "上传替换"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          disabled={slotBusy}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void upload(slot.id, file);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => restore(slot.id)}
                        disabled={slotBusy || !slot.overridden}
                        className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-body-md text-on-surface-variant hover:border-primary disabled:opacity-40"
                      >
                        <MaterialIcon name="restart_alt" className="text-[18px]" />
                        恢复默认
                      </button>
                    </div>
                  </div>

                  <ul
                    className={cn(
                      "mt-3 grid gap-3",
                      slot.kind === "carousel"
                        ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1 sm:max-w-sm",
                    )}
                  >
                    {current.map((url, index) => (
                      <li
                        key={`${url}-${index}`}
                        className="overflow-hidden rounded-lg border border-outline-variant bg-surface"
                      >
                        <div className="flex h-32 items-center justify-center bg-white p-2">
                          {/* A plain <img>: the URL may be an external storage URL that
                              next/image would have to be configured for, and an
                              operator's half-broken upload must not crash the panel. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`${slot.label} 预览 ${index + 1}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex items-center gap-1 border-t border-outline-variant px-2 py-1.5">
                          <span className="me-auto truncate text-technical-data text-on-surface-variant" title={url}>
                            {slot.kind === "carousel" ? `第 ${index + 1} 张` : "当前"}
                          </span>
                          {slot.kind === "carousel" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => move(slot.id, index, -1)}
                                disabled={slotBusy || index === 0}
                                aria-label={`把第 ${index + 1} 张上移`}
                                className="rounded border border-outline-variant p-1 text-on-surface-variant hover:border-primary disabled:opacity-30"
                              >
                                <MaterialIcon name="arrow_upward" className="text-[16px]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => move(slot.id, index, 1)}
                                disabled={slotBusy || index === current.length - 1}
                                aria-label={`把第 ${index + 1} 张下移`}
                                className="rounded border border-outline-variant p-1 text-on-surface-variant hover:border-primary disabled:opacity-30"
                              >
                                <MaterialIcon name="arrow_downward" className="text-[16px]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(slot.id, index)}
                                disabled={slotBusy}
                                aria-label={`删除第 ${index + 1} 张`}
                                className="rounded border border-outline-variant p-1 text-error hover:border-error disabled:opacity-30"
                              >
                                <MaterialIcon name="delete" className="text-[16px]" />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {slot.kind === "carousel" && current.length >= SITE_IMAGE_ITEMS_MAX ? (
                    <p className="mt-2 text-body-sm text-on-surface-variant">
                      已达上限 {SITE_IMAGE_ITEMS_MAX} 张；想再加请先删掉一张。
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {group.heroSettings ? (
            <div className="border-t border-outline-variant p-4">
              <h3 className="flex items-center gap-2 text-body-lg font-semibold text-on-surface">
                <MaterialIcon name="tune" className="text-[20px] text-primary" />
                轮播设置
              </h3>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                首屏轮播图超过 1 张时，按这个间隔自动切换；输入框里是当前保存的设置值。
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-4">
                <label className="flex flex-col gap-1 text-body-sm text-on-surface-variant">
                  切换间隔（秒）
                  <span className="flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={group.heroSettings.minIntervalMs / 1000}
                      max={group.heroSettings.maxIntervalMs / 1000}
                      step={group.heroSettings.stepIntervalMs / 1000}
                      value={heroSeconds}
                      disabled={busy === HERO_BUSY}
                      onChange={(event) => setHeroSeconds(event.target.value)}
                      className="w-24 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:outline-none disabled:opacity-60"
                    />
                    <span>秒</span>
                  </span>
                </label>
                <label className="inline-flex items-center gap-2 pb-2.5 text-body-md text-on-surface">
                  <input
                    type="checkbox"
                    checked={heroAutoplay}
                    disabled={busy === HERO_BUSY}
                    onChange={(event) => setHeroAutoplay(event.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  自动播放
                </label>
                <button
                  type="button"
                  onClick={() => void saveHeroSettings()}
                  disabled={busy === HERO_BUSY}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-body-md font-semibold text-on-primary disabled:opacity-60"
                >
                  <MaterialIcon name="save" className="text-[18px]" />
                  {busy === HERO_BUSY ? "保存中…" : "保存设置"}
                </button>
              </div>
              <p className="mt-2 text-technical-data text-on-surface-variant/70">
                可填 {group.heroSettings.minIntervalMs / 1000} ~{" "}
                {group.heroSettings.maxIntervalMs / 1000} 秒，默认{" "}
                {group.heroSettings.defaultIntervalMs / 1000} 秒。关闭自动播放后，
                访客仍可用左右箭头和圆点手动切换。
              </p>
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}
