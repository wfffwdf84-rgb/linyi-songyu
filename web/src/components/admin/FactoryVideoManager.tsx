"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { upload } from "@vercel/blob/client";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  FACTORY_VIDEO_MAX_BYTES,
  FACTORY_VIDEO_MAX_COUNT,
  FACTORY_VIDEO_TRANSCODE_MAX_BYTES,
  blobLooksLikeHevc,
  factoryVideoPreviewSrc,
  isPlayableFactoryVideoName,
  type FactoryVideo,
} from "@/lib/factory-videos";

function factoryUploadPath(file: File) {
  const fromName = file.name.match(/\.(mp4|webm|m4v)$/i)?.[1];
  const ext = fromName
    ? fromName.toLowerCase()
    : file.type === "video/webm"
      ? "webm"
      : "mp4";
  return `factory/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
}

type Session = {
  configured: boolean;
  storage: boolean;
  blob: boolean;
  authed: boolean;
};

export function FactoryVideoManager() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [videos, setVideos] = useState<FactoryVideo[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [silentVideo, setSilentVideo] = useState<Record<string, boolean>>({});

  const loadVideos = useCallback(async () => {
    const res = await fetch("/api/factory-videos", { cache: "no-store", credentials: "include" });
    const data = (await res.json()) as { videos?: FactoryVideo[] };
    setVideos(Array.isArray(data.videos) ? data.videos : []);
  }, []);

  const repairVideos = useCallback(async () => {
    setStatus("苹果视频正在转成电脑能看的格式，请稍候…");
    try {
      for (let step = 0; step < FACTORY_VIDEO_MAX_COUNT; step += 1) {
        const res = await fetch("/api/factory-videos/repair", { method: "POST", credentials: "include" });
        const data = (await res.json().catch(() => null)) as { changed?: number; videos?: FactoryVideo[] } | null;
        if (Array.isArray(data?.videos)) setVideos(data.videos);
        if (!data?.changed) break;
      }
    } finally {
      setStatus("");
      setSilentVideo({});
    }
  }, []);

  const loadSession = useCallback(async () => {
    const res = await fetch("/api/factory-videos/session", { cache: "no-store", credentials: "include" });
    const data = (await res.json()) as Session;
    setSession(data);
    if (data.authed) {
      await loadVideos();
      void repairVideos();
    }
  }, [loadVideos, repairVideos]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/factory-videos/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(
          res.status === 503
            ? "后台未配置上传口令。"
            : res.status === 429
              ? "尝试次数过多，请 15 分钟后再试。"
              : "口令不正确。",
        );
        return;
      }
      setPassword("");
      await loadSession();
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await fetch("/api/factory-videos/logout", { method: "POST", credentials: "include" });
    setVideos([]);
    await loadSession();
  }

  async function onUpload(file: File) {
    if (!session) return;
    if (videos.length >= FACTORY_VIDEO_MAX_COUNT) {
      setError(`最多 ${FACTORY_VIDEO_MAX_COUNT} 条厂区视频。`);
      return;
    }
    if (file.size > FACTORY_VIDEO_MAX_BYTES) {
      setError("单个视频不超过 200MB。请先压缩或剪短。");
      return;
    }
    if (!isPlayableFactoryVideoName(file.name) && file.type !== "video/mp4" && file.type !== "video/webm") {
      setError("请上传 MP4（H.264）。苹果手机拍的 MOV 在电脑上打不开。");
      return;
    }
    const hevc = await blobLooksLikeHevc(file);
    if (hevc && file.size > FACTORY_VIDEO_TRANSCODE_MAX_BYTES) {
      setError("这是苹果手机编码，电脑只有声音。请把视频剪到 40MB 以内，或在手机「设置 → 相机 → 格式」改成「兼容性最优先」后再传。");
      return;
    }
    setError("");
    setBusy(true);
    setProgress(0);
    setStatus(hevc ? "苹果视频正在转成电脑能看的格式，请不要关闭页面。" : "");
    const label = title.trim() || "厂区视频";
    const pathname = factoryUploadPath(file);
    try {
      if (session.blob) {
        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/factory-videos/upload",
          multipart: true,
          contentType: file.type || "video/mp4",
          clientPayload: JSON.stringify({ title: label }),
          onUploadProgress({ percentage }) {
            setProgress(Math.round(percentage));
          },
        });
        await fetch("/api/factory-videos/register", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: blob.url, title: label }),
        });
        await loadVideos();
        await repairVideos();
      } else {
        const form = new FormData();
        form.set("file", file);
        form.set("title", label);
        const res = await fetch("/api/factory-videos/local", { method: "POST", body: form });
        if (!res.ok) throw new Error("local");
        const data = (await res.json()) as { videos?: FactoryVideo[] };
        setVideos(data.videos ?? []);
      }
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/token|unauthorized|401/i.test(message)) {
        setError("登录已过期，请点退出后重新输入口令。");
      } else if (/mp4|mov|limit/i.test(message)) {
        setError("请用 MP4（H.264），不要用苹果 MOV。已满 8 条需先删除。");
      } else {
        setError(session.blob ? "上传失败。请用 MP4，传完前不要关闭或刷新页面。" : "本地保存失败。");
      }
    } finally {
      setBusy(false);
      setProgress(0);
      setStatus("");
    }
  }

  async function onRename(id: string, nextTitle: string) {
    const title = nextTitle.trim();
    if (!title) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/factory-videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("rename");
      const data = (await res.json()) as { videos?: FactoryVideo[] };
      setVideos(data.videos ?? []);
    } catch {
      setError("改标题失败。");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/factory-videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete");
      const data = (await res.json()) as { videos?: FactoryVideo[] };
      setVideos(data.videos ?? []);
    } catch {
      setError("删除失败。");
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return <p className="text-body-md text-on-surface-variant">正在检查后台…</p>;
  }

  if (!session.configured) {
    return (
      <div className="rounded border border-outline-variant bg-surface p-6">
        <p className="text-body-md text-on-surface">后台还没有设置上传口令，无法从电脑传到线上站。</p>
        <p className="mt-2 text-body-sm text-on-surface-variant">需要环境变量 FACTORY_VIDEO_PASSWORD 与 BLOB_READ_WRITE_TOKEN。</p>
      </div>
    );
  }

  if (!session.authed) {
    return (
      <form onSubmit={onLogin} className="max-w-md space-y-4 rounded border border-outline-variant bg-surface p-6">
        <label className="block text-technical-data text-on-surface-variant" htmlFor="factory-password">
          上传口令
        </label>
        <input
          id="factory-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
          autoComplete="current-password"
          required
        />
        {error ? <p className="text-body-sm text-error">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-primary px-6 py-3 font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60"
        >
          进入上传
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-body-sm text-on-surface-variant">
          {session.blob
            ? "上传后立即出现在首页厂区视频。"
            : session.storage
              ? "当前是本地预览。线上站需要开通 Vercel Blob。"
              : "线上存储未开通，无法把视频传到独立站。"}
        </p>
        <button type="button" onClick={() => void onLogout()} className="text-technical-data text-primary hover:underline">
          退出
        </button>
      </div>

      <div className="rounded border border-outline-variant bg-surface p-6">
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,video/x-m4v,.mp4,.webm,.m4v"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onUpload(file);
          }}
        />
        <label className="mb-2 block text-technical-data text-on-surface-variant" htmlFor="factory-title">
          标题（可选）
        </label>
        <input
          id="factory-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：热处理车间"
          className="mb-4 w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
        />
        <button
          type="button"
          disabled={busy || !(session.blob || session.storage)}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded bg-primary px-6 py-3 font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60"
        >
          <MaterialIcon name="upload" />
          从电脑选择视频
        </button>
        <p className="mt-3 text-body-sm text-on-surface-variant">
          请传 MP4。苹果手机默认编码在电脑上会只有声音没有画面，上传后网站会自动转。单条不超过 200MB，最多 {FACTORY_VIDEO_MAX_COUNT} 条。
        </p>
        {status ? <p className="mt-3 text-technical-data text-primary">{status}</p> : null}
        {busy && !status ? (
          <p className="mt-3 text-technical-data text-primary">
            {progress > 0 ? `正在上传 ${progress}% ，请不要关闭或刷新页面。` : "正在准备上传，请稍候。"}
          </p>
        ) : null}
        {error ? <p className="mt-3 text-body-sm text-error">{error}</p> : null}
      </div>

      {videos.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">还没有厂区视频。</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {videos.map((item) => (
            <li key={item.id} className="overflow-hidden rounded border border-outline-variant bg-surface">
              <video
                src={factoryVideoPreviewSrc(item.url)}
                controls
                playsInline
                preload="auto"
                className="aspect-video w-full bg-on-secondary-fixed"
                onLoadedData={(e) => {
                  const el = e.currentTarget;
                  if (el.duration > 1.5 && el.currentTime < 0.2) {
                    el.currentTime = Math.min(1, el.duration * 0.12);
                  }
                }}
                onTimeUpdate={(e) => {
                  const el = e.currentTarget;
                  if (el.videoWidth > 0) {
                    setSilentVideo((current) => (current[item.id] ? { ...current, [item.id]: false } : current));
                    return;
                  }
                  if (el.currentTime > 0.5) {
                    setSilentVideo((current) => (current[item.id] ? current : { ...current, [item.id]: true }));
                  }
                }}
              />
              <div className="flex flex-col gap-3 border-t border-outline-variant px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    defaultValue={item.title}
                    disabled={busy}
                    className="min-w-0 flex-1 rounded border border-outline-variant bg-surface px-3 py-2 text-technical-data text-on-surface"
                    onBlur={(e) => {
                      const next = e.target.value.trim();
                      if (next && next !== item.title) void onRename(item.id, next);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur();
                      }
                    }}
                    aria-label="视频标题"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onDelete(item.id)}
                    className="shrink-0 text-technical-data text-error hover:underline disabled:opacity-50"
                  >
                    删除
                  </button>
                </div>
                {/\.mov(\?|$)/i.test(item.url) ? (
                  <span className="text-body-sm text-error">MOV 电脑打不开，请删除后改传 MP4</span>
                ) : silentVideo[item.id] ? (
                  <span className="text-body-sm text-error">苹果编码，电脑只有声音。请稍候，正在转成能看的格式。</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
