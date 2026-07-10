import { createServerClient, type SupabaseClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

const SERVER_AUTH_TIMEOUT_MS = 8000;

/**
 * Server Components, Route Handlers, and Server Actions.
 * Returns null if Supabase env is not set.
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient | null> {
  const { url, anonKey } = getSupabasePublicEnv();
  if (!url || !anonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* set from Server Component — ignore */
        }
      },
    },
  });
}

/** Fails fast when Supabase host is wrong or offline (ENOTFOUND / fetch failed). */
export async function safeServerAuthUser(): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return null;

    const timeout = new Promise<{ data: { user: null } }>((resolve) => {
      setTimeout(() => resolve({ data: { user: null } }), SERVER_AUTH_TIMEOUT_MS);
    });

    const result = await Promise.race([supabase.auth.getUser(), timeout]);
    return result.data.user ?? null;
  } catch {
    return null;
  }
}
