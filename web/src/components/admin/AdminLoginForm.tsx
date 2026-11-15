"use client";

import { useState, type FormEvent } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const ERRORS: Record<string, string> = {
  invalid_credentials: "用户名或密码错误。",
  too_many_attempts: "尝试次数过多，请 10 分钟后再试。",
  not_configured: "服务器未配置运营后台（需要 ADMIN_SESSION_SECRET 与 BLOB_READ_WRITE_TOKEN）。",
  unavailable: "后台暂时不可用，请稍后再试。",
};

export function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        // A full load on purpose: the cookie just changed and the server layout
        // has to render the shell with it, which a client-side push would not do.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/admin");
        return;
      }
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(ERRORS[data?.error ?? ""] ?? "登录失败，请重试。");
    } catch {
      setError("网络错误，请重试。");
    }
    setBusy(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
    >
      <h1 className="flex items-center gap-2 text-headline-md text-on-surface">
        <MaterialIcon name="admin_panel_settings" className="text-primary" />
        运营后台
      </h1>
      <p className="text-body-sm text-on-surface-variant">用运营账号登录，查看询盘与统计数据。</p>

      <div className="space-y-1">
        <label className="block text-technical-data text-on-surface-variant" htmlFor="admin-username">
          用户名
        </label>
        <input
          id="admin-username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-technical-data text-on-surface-variant" htmlFor="admin-password">
          密码
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
        />
      </div>

      {error ? (
        <p role="alert" className="text-body-sm text-error">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy || username.length === 0 || password.length === 0}
        className="w-full rounded-xl bg-primary py-3 text-headline-md text-on-primary disabled:opacity-60"
      >
        {busy ? "验证中…" : "登录"}
      </button>
    </form>
  );
}
