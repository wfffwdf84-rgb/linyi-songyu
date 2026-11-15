"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type Role = "owner" | "editor" | "sales";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  /** Accounts are owner-only. */
  ownerOnly?: boolean;
};

const ITEMS: NavItem[] = [
  { href: "/admin", label: "概览", icon: "dashboard" },
  { href: "/admin/inquiries", label: "询盘", icon: "inbox" },
  { href: "/admin/users", label: "账号", icon: "group", ownerOnly: true },
];

/** Sections the next phase will add; shown disabled so nobody hits a 404. */
const COMING_SOON = [
  { label: "产品", icon: "widgets" },
  { label: "文案", icon: "edit_note" },
  { label: "公告", icon: "campaign" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname() ?? "";
  const items = ITEMS.filter((item) => !item.ownerOnly || role === "owner");

  return (
    <nav aria-label="后台导航" className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-md font-semibold text-on-primary"
                : "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-body-md text-on-surface-variant hover:bg-surface-container"
            }
          >
            <MaterialIcon name={item.icon} className="text-[20px]" />
            {item.label}
          </Link>
        );
      })}

      {/* Content editing arrives in a later phase; sales never sees it. */}
      {role !== "sales" ? (
        <div className="mt-2 hidden border-t border-outline-variant pt-3 md:block">
          <p className="mb-1 px-4 text-label-caps text-on-surface-variant">内容</p>
          {COMING_SOON.map((item) => (
            <span
              key={item.label}
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-2 rounded-lg px-4 py-2 text-body-md text-on-surface-variant/50"
            >
              <MaterialIcon name={item.icon} className="text-[20px]" />
              {item.label}
              <span className="ms-auto rounded bg-surface-container px-1.5 py-0.5 text-label-caps text-on-surface-variant">
                即将上线
              </span>
            </span>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
