"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, KeyRound, UserPlus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getHubNavForRole, isHubNavItemActive } from "@/lib/auth/account-hub-nav";

import guardian from "./guardian-family-controls.module.css";

const TAB_ICONS: Record<string, LucideIcon> = {
  account: Home,
  family: Users,
  "add-child": UserPlus,
  dashboard: BarChart3,
  approve: KeyRound,
};

export function GuardianAccountNav() {
  const pathname = usePathname();
  const nav = getHubNavForRole("parent");

  return (
    <nav className={guardian.tabNav} aria-label="Family Controls">
      {nav.map((item) => {
        const activeTab = isHubNavItemActive(pathname, item, "parent");
        const Icon = TAB_ICONS[item.id] ?? Home;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`${guardian.tabLink} ${activeTab ? guardian.tabLinkActive : ""}`}
            aria-current={activeTab ? "page" : undefined}
          >
            <Icon size={15} strokeWidth={2.25} aria-hidden />
            <span className={guardian.tabLinkLabel}>{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
