"use client";

import { Button } from "@/components/ui/button";
import { useAccountSignOut } from "@/hooks/use-account-sign-out";

import studio from "./learner-account-studio.module.css";

export function LearnerSignOutButton() {
  const { signOut, pending } = useAccountSignOut();

  return (
    <Button
      type="button"
      variant="outline"
      className={studio.signOutBtn}
      onClick={signOut}
      disabled={pending}
    >
      Sign out
    </Button>
  );
}
