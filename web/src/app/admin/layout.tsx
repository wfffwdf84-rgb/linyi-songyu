import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminNav } from "@/components/admin/AdminNav";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { adminRoleLabels, getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "运营后台",
  robots: { index: false, follow: false },
};

/**
 * The middleware hands the typed path over in this header. Without it the shell
 * cannot tell /admin/login from the pages behind it, and a guard here would
 * redirect the login form to itself.
 */
const ADMIN_PATH_HEADER = "x-admin-path";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAdminSession();
  const path = (await headers()).get(ADMIN_PATH_HEADER) ?? "";
  const onLoginRoute = path === "/admin/login" || path === "/admin/login/";

  // An unknown path means the middleware did not run: let the page's own guard
  // decide, rather than bouncing /admin/login through an endless redirect.
  if (!session && path && !onLoginRoute) redirect("/admin/login");
  if (session && onLoginRoute) redirect("/admin");

  return (
    <html lang="zh-CN" className="h-full font-zh">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-on-background antialiased">
        {!session ? (
          <main className="flex min-h-screen items-center justify-center px-margin-mobile py-10">{children}</main>
        ) : (
          <div className="mx-auto flex min-h-screen w-full max-w-container-max flex-col md:flex-row">
            <aside className="shrink-0 border-b border-outline-variant bg-surface-container-lowest p-3 md:w-56 md:border-e md:border-b-0 md:p-4">
              <p className="mb-4 hidden items-center gap-2 px-2 text-headline-md text-on-surface md:flex">
                <MaterialIcon name="admin_panel_settings" className="text-primary" />
                运营后台
              </p>
              <AdminNav role={session.role} />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant px-margin-mobile py-3 md:px-6">
                <p className="text-body-sm text-on-surface-variant">临沂松昱国际贸易 · 内部使用，请勿外传</p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-2 text-technical-data text-on-surface">
                    <MaterialIcon name="account_circle" className="text-[18px] text-on-surface-variant" />
                    {session.name || session.userId}
                    <span className="rounded bg-secondary-container px-2 py-0.5 text-label-caps text-on-secondary-container">
                      {adminRoleLabels[session.role]}
                    </span>
                  </span>
                  <AdminLogoutButton />
                </div>
              </header>

              <main className="flex-1 px-margin-mobile py-6 md:px-6">{children}</main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
