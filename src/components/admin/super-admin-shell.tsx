"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Library, Shield } from "lucide-react";

import { SuperAdminSignOutButton } from "@/components/admin/super-admin-sign-out-button";

import styles from "./super-admin-shell.module.css";

type Props = {
  email: string;
  displayName: string;
  children: React.ReactNode;
};

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/library", label: "Library", icon: Library, exact: false },
  { href: "/learn/library", label: "Preview library", icon: BookOpen, exact: false },
] as const;

export function SuperAdminShell({ email, displayName, children }: Props) {
  const pathname = usePathname();
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden>
            <Shield size={18} />
          </span>
          <div>
            <p className={`font-fredoka ${styles.brandTitle}`}>Super Admin</p>
            <p className={`font-nunito ${styles.brandSub}`}>Allen Girls Adventures</p>
          </div>
        </div>
        <div className={styles.profile}>
          <span className={styles.avatar} aria-hidden>
            {initial}
          </span>
          <div className={styles.profileText}>
            <p className={`font-nunito ${styles.profileName}`}>{displayName}</p>
            <p className={`font-nunito ${styles.profileEmail}`}>{email}</p>
          </div>
          <SuperAdminSignOutButton />
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.sideNav} aria-label="Super admin">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink}${active ? ` ${styles.navLinkActive}` : ""}`}
              >
                <Icon size={16} aria-hidden />
                {item.label}
              </Link>
            );
          })}
          <Link href="/admin/login" className={styles.navLinkMuted}>
            Admin login
          </Link>
        </nav>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
