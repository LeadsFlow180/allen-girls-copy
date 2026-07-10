"use client";

import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

import {
  getSupabasePublicEnv,
  isLearnSupabaseFetchEnabled,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

const FETCH_TIMEOUT_MS = 4000;

const noopAuthStorage = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
};

function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
  });
}

/** Account/login — SSR browser client (cookies + session refresh). */
let browserClientSingleton: SupabaseClient | null | undefined;

export function createBrowserSupabaseClient(): SupabaseClient | null {
  if (browserClientSingleton !== undefined) {
    return browserClientSingleton;
  }

  if (!isSupabaseConfigured()) {
    browserClientSingleton = null;
    return null;
  }

  const { url, anonKey } = getSupabasePublicEnv();

  browserClientSingleton = createBrowserClient(url, anonKey, {
    global: { fetch: fetchWithTimeout },
  });

  return browserClientSingleton;
}

let learnClientSingleton: SupabaseClient | null | undefined;

/**
 * Learn UI data client — plain supabase-js (NOT @supabase/ssr).
 * SSR browser client reads auth cookies and runs _recoverAndRefresh → "Failed to fetch"
 * when cookies are stale or Supabase is unreachable.
 */
export function getLearnSupabaseClient(): SupabaseClient | null {
  if (learnClientSingleton !== undefined) {
    return learnClientSingleton;
  }

  if (!isLearnSupabaseFetchEnabled()) {
    learnClientSingleton = null;
    return null;
  }

  const { url, anonKey } = getSupabasePublicEnv();

  learnClientSingleton = createClient(url, anonKey, {
    global: { fetch: fetchWithTimeout },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      storage: noopAuthStorage,
    },
  });

  return learnClientSingleton;
}

export function createLearnSupabaseClient(): SupabaseClient | null {
  return getLearnSupabaseClient();
}

export async function safeGetAuthUser(
  supabase: SupabaseClient,
): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Signed-in user from auth cookies (account session).
 * Use this for Learn progress APIs — createLearnSupabaseClient() has no session storage.
 */
export async function safeGetSessionAuthUser(): Promise<User | null> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) return null;
  return safeGetAuthUser(supabase);
}
