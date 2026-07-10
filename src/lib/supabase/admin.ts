import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv, isSupabaseConfigured } from "@/lib/supabase/env";

/** Server-only writes (e.g. signed guest playback progress). Bypasses RLS. */
export function createServiceRoleSupabaseClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!isSupabaseConfigured() || !serviceKey) {
    return null;
  }

  const { url } = getSupabasePublicEnv();
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
