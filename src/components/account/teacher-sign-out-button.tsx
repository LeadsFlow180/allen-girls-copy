"use client";

import { Button } from "@/components/ui/button";
import { useAccountSignOut } from "@/hooks/use-account-sign-out";

import styles from "./account-hub-shell.module.css";

export function TeacherSignOutButton({ className }: { className?: string }) {
  const { signOut, pending } = useAccountSignOut();

  return (
    <Button
      type="button"
      variant="outline"
      className={className ?? styles.signOutBtn}
      onClick={signOut}
      disabled={pending}
    >
      Sign out
    </Button>
  );
}
