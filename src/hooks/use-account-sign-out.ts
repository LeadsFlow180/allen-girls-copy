"use client";

import { useTransition } from "react";

import { signOutAction } from "@/app/account/actions";
import { signOutFromBrowser } from "@/lib/auth/client-sign-out";

export function useAccountSignOut() {
  const [pending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      await signOutFromBrowser();
      await signOutAction();
    });
  }

  return { signOut, pending };
}
