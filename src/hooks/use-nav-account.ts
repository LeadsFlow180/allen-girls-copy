"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { NAV_ACCOUNT_SYNC_EVENT } from "@/lib/auth/nav-account-sync";
import { avatarColorForUser, avatarInitial } from "@/lib/learn/leaderboard";
import { createBrowserSupabaseClient, safeGetAuthUser } from "@/lib/supabase/client";

export type NavAccountState = {
  loading: boolean;
  signedIn: boolean;
  userId: string | null;
  displayName: string;
  shortName: string;
  initial: string;
  avatarUrl: string | null;
  avatarColor: string;
};

const GUEST_STATE: NavAccountState = {
  loading: true,
  signedIn: false,
  userId: null,
  displayName: "",
  shortName: "",
  initial: "",
  avatarUrl: null,
  avatarColor: "#7c3aed",
};

function readAvatarUrl(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const url = meta.avatar_url ?? meta.picture ?? meta.avatar;
  return typeof url === "string" && url.trim() ? url.trim() : null;
}

function readDisplayName(user: User, profileName?: string | null): string {
  const fromProfile = profileName?.trim();
  if (fromProfile) return fromProfile;

  const fromMeta = user.user_metadata?.display_name;
  if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta.trim();

  const emailPrefix = user.email?.split("@")[0]?.trim();
  if (emailPrefix) return emailPrefix;

  return "Account";
}

function shortLabel(displayName: string): string {
  const first = displayName.trim().split(/\s+/)[0];
  return first || displayName;
}

async function loadNavAccount(): Promise<NavAccountState> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    return { ...GUEST_STATE, loading: false };
  }

  const user = await safeGetAuthUser(supabase);
  if (!user) {
    return { ...GUEST_STATE, loading: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = readDisplayName(user, profile?.display_name);
  const shortName = shortLabel(displayName);

  return {
    loading: false,
    signedIn: true,
    userId: user.id,
    displayName,
    shortName,
    initial: avatarInitial(displayName),
    avatarUrl: readAvatarUrl(user),
    avatarColor: avatarColorForUser(user.id),
  };
}

export function useNavAccount(): NavAccountState {
  const pathname = usePathname();
  const [account, setAccount] = useState<NavAccountState>(GUEST_STATE);

  const refresh = useCallback(async () => {
    const next = await loadNavAccount();
    setAccount(next);
  }, []);

  useEffect(() => {
    let active = true;

    const runRefresh = async () => {
      const next = await loadNavAccount();
      if (active) setAccount(next);
    };

    void runRefresh();

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      return () => {
        active = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "SIGNED_OUT" || !session) {
        setAccount({ ...GUEST_STATE, loading: false });
        return;
      }

      void runRefresh();
    });

    const onSync = () => {
      void runRefresh();
    };

    window.addEventListener(NAV_ACCOUNT_SYNC_EVENT, onSync);

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener(NAV_ACCOUNT_SYNC_EVENT, onSync);
    };
  }, []);

  useEffect(() => {
    void refresh();
  }, [pathname, refresh]);

  return account;
}
