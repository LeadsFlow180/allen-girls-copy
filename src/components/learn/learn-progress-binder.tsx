"use client";

import { useEffect, useRef } from "react";

import { LEARN_GUEST_SESSION_STORAGE_KEY } from "@/lib/learn/constants";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/** One-time merge of guest cloud progress into the signed-in learner per browser session. */
export function LearnProgressBinder() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || typeof window === "undefined") return;
    ran.current = true;

    void (async () => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const guestSessionId = window.localStorage.getItem(LEARN_GUEST_SESSION_STORAGE_KEY);

      try {
        const res = await fetch("/api/learn/bind-guest-progress", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(guestSessionId ? { guestSessionId } : {}),
        });
        if (res.ok) {
          if (guestSessionId) {
            window.localStorage.removeItem(LEARN_GUEST_SESSION_STORAGE_KEY);
          }
          window.dispatchEvent(new CustomEvent("learn:playback-updated"));
        }
      } catch {
        /* offline */
      }
    })();
  }, []);

  return null;
}
