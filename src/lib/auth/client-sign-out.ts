"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

import { broadcastNavAccountSync } from "./nav-account-sync";

/** Clears the browser auth session and notifies the top nav to refresh. */
export async function signOutFromBrowser(): Promise<void> {
  const supabase = createBrowserSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  broadcastNavAccountSync();
}
