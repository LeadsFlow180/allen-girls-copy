import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicEnv, isSupabaseConfigured } from "@/lib/supabase/env";

const AUTH_REFRESH_TIMEOUT_MS = 2000;

function shouldSkipAuthRefresh(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname === "/learn" || pathname.startsWith("/learn/")) return true;
  if (!pathname.startsWith("/account")) return true;
  return false;
}

/** Passed to Server Components via headers() — must be on the request, not the response. */
function withPathnameRequest(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return { request: { headers: requestHeaders } };
}

async function refreshSessionWithTimeout(getUser: () => Promise<unknown>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("Supabase auth refresh timed out")),
      AUTH_REFRESH_TIMEOUT_MS,
    );
  });

  try {
    await Promise.race([getUser(), timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Refreshes auth cookies only on /account/* (login, signup, etc.).
 * Skips /learn, /api, /_next — avoids edge "fetch failed" spam in dev.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (shouldSkipAuthRefresh(pathname)) {
    return NextResponse.next(withPathnameRequest(request));
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.next(withPathnameRequest(request));
  }

  const { url, anonKey } = getSupabasePublicEnv();
  let supabaseResponse = NextResponse.next(withPathnameRequest(request));

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next(withPathnameRequest(request));
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    await refreshSessionWithTimeout(() => supabase.auth.getUser());
  } catch {
    /* fail open */
  }

  return supabaseResponse;
}
