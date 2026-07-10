"use client";

import { Button } from "@/components/ui/button";
import { useAccountSignOut } from "@/hooks/use-account-sign-out";

import guardian from "./guardian-family-controls.module.css";

export function GuardianSignOutButton() {
  const { signOut, pending } = useAccountSignOut();

  return (
    <Button
      type="button"
      variant="outline"
      className={guardian.signOutBtn}
      onClick={signOut}
      disabled={pending}
    >
      Sign out
    </Button>
  );
}
