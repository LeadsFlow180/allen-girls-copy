"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

import adminLoginHero from "@/assets/images/auth/admin-login-hero.png";
import { AccountAuthShell } from "@/components/auth/account-auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { SIGN_IN_ROLE_MISMATCH_MESSAGE } from "@/lib/auth/sign-in-messages";

import styles from "./admin-login.module.css";
import authStyles from "@/components/auth/account-auth.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserSupabaseClient();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Supabase is not set up yet. Add keys to .env.local.");
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
      : { data: null };

    if (profile?.role !== "super_admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setError(SIGN_IN_ROLE_MISMATCH_MESSAGE);
      return;
    }

    setLoading(false);
    router.push("/admin");
    router.refresh();
  }

  return (
    <AccountAuthShell
      heroImage={adminLoginHero}
      heroAlt="Magical platform command center for super administrators"
      heroBadge="Platform administration"
    >
      <div className={`${authStyles.card} ${authStyles.formCard} ${styles.card}`}>
        <header className={styles.header}>
          <span className={styles.shieldBadge} aria-hidden>
            <Shield size={22} />
          </span>
          <p className={styles.kicker}>Allen Girls Adventures</p>
          <h1 className={`font-fredoka ${styles.title}`}>Super Admin sign in</h1>
          <p className={`font-nunito ${styles.subtitle}`}>
            Platform control only — manage users, library stories, and operations.
          </p>
        </header>

        <div className={authStyles.cardBody}>
          {!supabase && (
            <p className={authStyles.emailNote}>
              Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>.
            </p>
          )}

          <form onSubmit={onSubmit}>
            <div className={authStyles.field}>
              <label htmlFor="admin-email" className={authStyles.fieldLabel}>
                Admin email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                className={authStyles.authInput}
              />
            </div>
            <PasswordField
              id="admin-password"
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
            {error ? <p className={authStyles.error}>{error}</p> : null}
            <button
              type="submit"
              className={`${authStyles.submitBtn} ${styles.submitBtn}`}
              disabled={loading || !supabase}
            >
              {loading ? "Signing in…" : "Enter Super Admin"}
            </button>
          </form>

          <p className={styles.footerNote}>
            Super Admin accounts are set up by platform administration, not through public signup.
          </p>

          <p className={authStyles.footerLinks} style={{ borderTop: "none", paddingTop: "0.65rem" }}>
            <Link href="/account/login" className={authStyles.footerLinkMuted}>
              Learner / Guardian / Teacher login
            </Link>
            <Link href="/" className={authStyles.footerLinkMuted}>
              Home
            </Link>
          </p>
        </div>
      </div>
    </AccountAuthShell>
  );
}
