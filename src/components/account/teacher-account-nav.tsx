"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Library, UserPlus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getHubNavForRole, isHubNavItemActive } from "@/lib/auth/account-hub-nav";

import educator from "./teacher-educator.module.css";

const TEACHER_TAB_ICONS: Record<string, LucideIcon> = {
  account: Home,
  classroom: Users,
  library: Library,
  "link-student": UserPlus,
};

export function TeacherAccountNav() {
  const pathname = usePathname();
  const nav = getHubNavForRole("teacher");

  return (
    <nav className={educator.tabNav} aria-label="Educator sections">
      {nav.map((item) => {
        const activeTab = isHubNavItemActive(pathname, item, "teacher");
        const Icon = TEACHER_TAB_ICONS[item.id] ?? BookOpen;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`${educator.tabLink} ${activeTab ? educator.tabLinkActive : ""}`}
            aria-current={activeTab ? "page" : undefined}
          >
            <Icon size={15} strokeWidth={2.25} aria-hidden />
            <span className={`font-nunito ${educator.tabLinkLabel}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
