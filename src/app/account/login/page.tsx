"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AccountAuthPortalBackdrop } from "@/components/auth/account-auth-portal-backdrop";
import { SignInGuide, useSignInAudience, type SignInAudience } from "@/components/auth/sign-in-guide";
import type { AccountRole } from "@/lib/auth/account-hub-nav";
import { SIGN_IN_ROLE_MISMATCH_MESSAGE } from "@/lib/auth/sign-in-messages";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function audienceToRole(audience: SignInAudience): AccountRole {
  if (audience === "parent") return "parent";
  if (audience === "teacher") return "teacher";
  if (audience === "admin") return "super_admin";
  return "student";
}

import styles from "@/components/auth/account-auth.module.css";

export default function AccountLoginPage() {
  const router = useRouter();
  const [audience, setAudience] = useSignInAudience("parent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserSupabaseClient();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      setError("Supabase is not set up yet. Add keys to .env.local (see .env.example).");
      return;
    }
    setLoading(true);
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signError) {
      setLoading(false);
      setError(signError.message);
      return;
    }

    const expectedRole = audienceToRole(audience);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
      : { data: null };

    const actualRole = (profile?.role as AccountRole | undefined) ?? "student";
    if (actualRole !== expectedRole) {
      await supabase.auth.signOut();
      setLoading(false);
      setError(SIGN_IN_ROLE_MISMATCH_MESSAGE);
      return;
    }

    setLoading(false);
    router.push(audience === "admin" ? "/admin" : "/account");
    router.refresh();
  }

  const emailPlaceholder =
    audience === "kid"
      ? "Email from your parent"
      : audience === "teacher"
        ? "teacher@school.edu"
        : audience === "admin"
          ? "admin@yourdomain.com"
          : "your@email.com";

  const submitLabel =
    audience === "admin"
      ? loading
        ? "Opening dashboard…"
        : "Enter Super Admin"
      : loading
        ? "Opening portal…"
        : "Sign in";

  return (
    <div className={styles.page}>
      <AccountAuthPortalBackdrop />
      <div className={styles.shell}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <p className={styles.portalKicker}>Allen Girls Adventures</p>
            <h1 className={styles.title}>Enter the portal</h1>
            <p className={styles.subtitle}>
              Choose your role, then sign in with the email and password for that account.
            </p>
          </header>

          <div className={styles.cardBody}>
            <SignInGuide audience={audience} onAudienceChange={setAudience} />

            <hr className={styles.divider} aria-hidden />

            {!supabase && (
              <p className={styles.emailNote}>
                Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
                <code>.env.local</code>.
              </p>
            )}

            <form onSubmit={onSubmit}>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.fieldLabel}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={emailPlaceholder}
                  className={styles.authInput}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="password" className={styles.fieldLabel}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className={styles.authInput}
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.submitBtn} disabled={loading || !supabase}>
                {submitLabel}
              </button>
            </form>

            <p className={styles.footerLinks} style={{ borderTop: "none", paddingTop: "0.65rem" }}>
              {audience !== "admin" ? (
                <>
                  <span className={styles.footerLinkMuted}>No account?</span>
                  <Link href="/account/signup" className={styles.footerLink}>
                    Create account
                  </Link>
                </>
              ) : (
                <span className={styles.footerLinkMuted}>
                  Super Admin accounts are set up by platform administration.
                </span>
              )}
              <Link href="/" className={styles.footerLinkMuted}>
                Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
