"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AccountAuthPortalBackdrop } from "@/components/auth/account-auth-portal-backdrop";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

import styles from "@/components/auth/account-auth.module.css";

type Role = "student" | "parent" | "teacher";

const ROLE_OPTIONS: {
  value: Role;
  emoji: string;
  title: string;
  desc: string;
}[] = [
  {
    value: "parent",
    emoji: "💜",
    title: "Parent / guardian",
    desc: "For grown-ups. No learner code needed. Add kids from Family profiles after sign-up.",
  },
  {
    value: "student",
    emoji: "🎒",
    title: "Student / learner",
    desc: "For kids. A parent must verify you (code) before Learn unlocks — or ask them to create your login.",
  },
  {
    value: "teacher",
    emoji: "🏫",
    title: "Teacher",
    desc: "For classrooms. Use your school email. No guardian approval.",
  },
];

export default function AccountSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("parent");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserSupabaseClient();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!supabase) {
      setError("Supabase is not set up yet. Add keys to .env.local.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { data, error: signError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
        data: {
          display_name: displayName.trim().slice(0, 80),
          role,
        },
      },
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    if (data.user && !data.session) {
      setMessage("Check your email for a confirmation link, then come back and sign in.");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <AccountAuthPortalBackdrop />
      <div className={styles.shell}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <p className={styles.portalKicker}>New adventurer</p>
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>
              Pick one role below — guardian, learner, or teacher. You cannot change role later without a new account.
            </p>
          </header>

          <div className={styles.cardBody}>
            <p className={styles.whoLabel}>I am signing up as…</p>
            <div className={styles.roleRow}>
              {ROLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`${styles.roleOption} ${role === opt.value ? styles.roleOptionActive : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={role === opt.value}
                    onChange={() => setRole(opt.value)}
                  />
                  <span>
                    <span className={styles.roleOptionTitle}>
                      {opt.emoji} {opt.title}
                    </span>
                    <span className={styles.roleOptionDesc}>{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>

            {role === "parent" && (
              <div className={`${styles.guide} ${styles.guideParent}`}>
                <p className={styles.guideTitle}>What happens next (guardian)</p>
                <ol className={styles.steps}>
                  <li>Finish this form with your email and password.</li>
                  <li>Sign in — no approval code needed for you.</li>
                  <li>
                    Open{" "}
                    <Link href="/parent/children/new" className={styles.footerLink}>
                      Create learner profile
                    </Link>{" "}
                    to add each child’s login.
                  </li>
                </ol>
              </div>
            )}

            {role === "student" && (
              <div className={`${styles.guide} ${styles.guideKid}`}>
                <p className={styles.guideTitle}>What happens next (learner)</p>
                <ol className={styles.steps}>
                  <li>Finish this form with your email and password.</li>
                  <li>You get a learner code — share it with your parent.</li>
                  <li>They approve you; then Learn, quests, and rewards unlock.</li>
                </ol>
                <p className={styles.note}>
                  Easier option: ask your parent to create your account — then you can sign in right away.
                </p>
              </div>
            )}

            {role === "teacher" && (
              <div className={`${styles.guide} ${styles.guideTeacher}`}>
                <p className={styles.guideTitle}>What happens next (teacher)</p>
                <ol className={styles.steps}>
                  <li>Finish this form with your email and password.</li>
                  <li>Sign in and open your Classroom dashboard.</li>
                  <li>Link students with their learner codes when ready.</li>
                </ol>
              </div>
            )}

            <hr className={styles.divider} aria-hidden />

            {!supabase && (
              <p className={styles.emailNote}>
                Add Supabase keys to <code>.env.local</code> first.
              </p>
            )}

            <form onSubmit={onSubmit}>
              <div className={styles.field}>
                <label htmlFor="displayName" className={styles.fieldLabel}>
                  {role === "parent" ? "Your name" : role === "teacher" ? "Your name" : "Your first name or nickname"}
                </label>
                <input
                  id="displayName"
                  autoComplete="nickname"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={role === "parent" ? "Jane Parent" : "Maya"}
                  className={styles.authInput}
                />
              </div>

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
                  placeholder={role === "teacher" ? "you@school.edu" : "you@email.com"}
                  className={styles.authInput}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="password" className={styles.fieldLabel}>
                  Password (8+ characters)
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={styles.authInput}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}
              {message && <p className={styles.success}>{message}</p>}

              <button type="submit" className={styles.submitBtn} disabled={loading || !supabase}>
                {loading ? "Forging account…" : "Create account"}
              </button>
            </form>

            <p className={styles.footerLinks}>
              <span className={styles.footerLinkMuted}>Already have an account?</span>
              <Link href="/account/login" className={styles.footerLink}>
                Sign in
              </Link>
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
