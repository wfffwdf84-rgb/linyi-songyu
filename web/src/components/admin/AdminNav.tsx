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
  /** Content editing: owners and editors, never sales. */
  content?: boolean;
};

const ITEMS: NavItem[] = [
  { href: "/admin", label: "概览", icon: "dashboard" },
  { href: "/admin/inquiries", label: "询盘", icon: "inbox" },
  { href: "/admin/products", label: "产品", icon: "widgets", content: true },
  { href: "/admin/copy", label: "文案", icon: "edit_note", content: true },
  { href: "/admin/announcements", label: "公告", icon: "campaign", content: true },
  { href: "/admin/users", label: "账号", icon: "group", ownerOnly: true },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname() ?? "";
  const items = ITEMS.filter(
    (item) => (!item.ownerOnly || role === "owner") && (!item.content || role !== "sales"),
  );

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
    </nav>
  );
}
