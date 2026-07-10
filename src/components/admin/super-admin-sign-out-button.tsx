"use client";

import { LogOut } from "lucide-react";

import { useAdminSignOut } from "@/hooks/use-admin-sign-out";

import styles from "./super-admin-shell.module.css";

export function SuperAdminSignOutButton() {
  const { signOut, pending } = useAdminSignOut();

  return (
    <button type="button" className={styles.signOutBtn} onClick={signOut} disabled={pending}>
      <LogOut size={15} aria-hidden />
      Sign out
    </button>
  );
}
