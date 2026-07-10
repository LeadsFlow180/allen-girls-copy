"use client";

import { useTransition } from "react";

import { adminSignOutAction } from "@/app/admin/actions";
import { signOutFromBrowser } from "@/lib/auth/client-sign-out";

export function useAdminSignOut() {
  const [pending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      await signOutFromBrowser();
      await adminSignOutAction();
    });
  }

  return { signOut, pending };
}
