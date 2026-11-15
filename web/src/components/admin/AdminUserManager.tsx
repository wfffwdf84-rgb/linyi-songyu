"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type Role = "owner" | "editor" | "sales";

type UserRow = {
  id: string;
  username: string;
  name: string;
  role: Role;
  createdAt: string;
  disabled?: boolean;
};

const ROLE_LABELS: Record<Role, string> = { owner: "所有者", editor: "运营", sales: "业务员" };

const ERRORS: Record<string, string> = {
  invalid_username: "用户名需 3–32 位，只用字母、数字和 . _ -",
  invalid_password: "密码至少 8 位。",
  invalid_role: "请选择有效的角色。",
  username_taken: "该用户名已存在。",
  last_owner: "至少要保留一个启用的所有者。",
  cannot_disable_self: "不能停用自己的账号。",
  not_found: "账号不存在。",
  unauthorized: "登录已过期，请重新登录。",
  forbidden: "需要所有者权限。",
  not_configured: "服务器未配置运营后台。",
};

async function send(method: "POST" | "PATCH", body: unknown) {
  const response = await fetch("/api/admin/users", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!response.ok || !data?.ok) return data?.error ?? "unavailable";
  return "";
}

export function AdminUserManager({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("sales");
  const [password, setPassword] = useState("");

  const [editingId, setEditingId] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const failure = await send("POST", { username, name, role, password });
    if (failure) {
      setError(ERRORS[failure] ?? "新增失败。");
      setBusy(false);
      return;
    }
    setUsername("");
    setName("");
    setRole("sales");
    setPassword("");
    setBusy(false);
    router.refresh();
  }

  async function onToggleDisabled(user: UserRow) {
    setBusy(true);
    setError("");
    const failure = await send("PATCH", { id: user.id, disabled: !user.disabled });
    setBusy(false);
    if (failure) {
      setError(ERRORS[failure] ?? "操作失败。");
      return;
    }
    router.refresh();
  }

  async function onChangePassword(user: UserRow) {
    setBusy(true);
    setError("");
    const failure = await send("PATCH", { id: user.id, password: newPassword });
    setBusy(false);
    if (failure) {
      setError(ERRORS[failure] ?? "改密码失败。");
      return;
    }
    setEditingId("");
    setNewPassword("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onCreate}
        className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-5"
      >
        <h2 className="flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="person_add" className="text-primary" />
          新增账号
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">用户名</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              placeholder="如 sales01"
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0"
            />
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">姓名</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="如 张伟"
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0"
            />
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">角色</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0"
            >
              <option value="owner">所有者（全部权限）</option>
              <option value="editor">运营（内容 + 询盘）</option>
              <option value="sales">业务员（仅询盘）</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">初始密码（至少 8 位）</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0"
            />
          </label>
        </div>
        {error ? (
          <p role="alert" className="text-body-sm text-error">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy || !username || password.length < 8}
          className="rounded-xl bg-primary px-5 py-2 text-body-md font-semibold text-on-primary disabled:opacity-60"
        >
          {busy ? "提交中…" : "新增账号"}
        </button>
      </form>

      <ul className="space-y-3">
        {users.map((user) => (
          <li
            key={user.id}
            className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-headline-md text-on-surface">{user.name}</span>
              <span className="rounded bg-surface-container px-2 py-0.5 text-technical-data text-on-surface-variant">
                {user.username}
              </span>
              <span className="rounded bg-secondary-container px-2 py-0.5 text-label-caps text-on-secondary-container">
                {ROLE_LABELS[user.role]}
              </span>
              {user.id === currentUserId ? (
                <span className="rounded bg-primary-fixed px-2 py-0.5 text-label-caps text-on-primary-fixed">
                  我
                </span>
              ) : null}
              {user.disabled ? (
                <span className="rounded bg-error px-2 py-0.5 text-label-caps text-on-error">已停用</span>
              ) : null}
              <span className="text-technical-data text-on-surface-variant">
                创建于 {new Date(user.createdAt).toISOString().slice(0, 10)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void onToggleDisabled(user)}
                disabled={busy || user.id === currentUserId}
                className="rounded border border-outline-variant px-3 py-1 text-technical-data text-on-surface-variant hover:border-primary disabled:opacity-50"
              >
                {user.disabled ? "启用" : "停用"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(editingId === user.id ? "" : user.id);
                  setNewPassword("");
                  setError("");
                }}
                className="rounded border border-outline-variant px-3 py-1 text-technical-data text-on-surface-variant hover:border-primary"
              >
                改密码
              </button>
              {editingId === user.id ? (
                <span className="flex flex-wrap items-center gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="新密码（至少 8 位）"
                    autoComplete="new-password"
                    className="rounded-lg border-2 border-outline-variant bg-surface px-3 py-1 text-body-sm text-on-surface focus:border-primary focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => void onChangePassword(user)}
                    disabled={busy || newPassword.length < 8}
                    className="rounded bg-primary px-3 py-1 text-technical-data font-semibold text-on-primary disabled:opacity-60"
                  >
                    保存
                  </button>
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
