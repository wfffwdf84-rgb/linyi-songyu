import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminUserManager } from "@/components/admin/AdminUserManager";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAdminSession, listAdminUsers, requireRole, type AdminUserView } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "账号 · 运营后台",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (!requireRole(session, ["owner"])) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
        <p className="mb-2 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="lock" className="text-primary" />
          仅所有者可以管理账号
        </p>
        <p className="text-body-md text-on-surface-variant">需要新增账号或改密码，请找所有者操作。</p>
      </div>
    );
  }

  let users: AdminUserView[] = [];
  let loadError = "";
  try {
    users = await listAdminUsers();
  } catch (error) {
    console.error("admin users load failed", error);
    loadError = "账号数据无法读取：可能是 Blob 不可用，或加密密钥已更换。";
  }

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
        <MaterialIcon name="group" className="text-primary" />
        账号
      </h1>
      <p className="text-body-sm text-on-surface-variant">
        角色说明：所有者可管理账号；运营可编辑内容并处理询盘；业务员只能查看询盘、标记已读和导出。
      </p>

      {loadError ? (
        <p className="rounded-xl border border-error bg-error-container p-6 text-body-md text-on-error-container">
          {loadError}
        </p>
      ) : (
        <AdminUserManager users={users} currentUserId={session.userId} />
      )}
    </div>
  );
}
