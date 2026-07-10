/**
 * Supabase public env (browser + server). Throws in dev if misconfigured.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabasePublicEnv();
  return Boolean(url && anonKey);
}

/** Browser /learn pages: set NEXT_PUBLIC_LEARN_USE_SUPABASE=true to load curriculum from DB */
export function isLearnSupabaseFetchEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_LEARN_USE_SUPABASE === "true" &&
    isSupabaseConfigured()
  );
}

/** Server /api/learn/* auth: off by default so bad SUPABASE_URL does not spam ENOTFOUND */
export function isSupabaseServerAuthEnabled(): boolean {
  return (
    process.env.SUPABASE_SERVER_AUTH === "true" && isSupabaseConfigured()
  );
}
