"use client";

import { useState } from "react";

import styles from "../../family.module.css";

const ERROR_MESSAGES: Record<string, string> = {
  display_name_required: "Please enter your child's display name.",
  invalid_email: "Please enter a valid email for sign-in.",
  password_too_short: "Password must be at least 8 characters.",
  email_in_use: "That email is already registered. Try another or sign in.",
  not_parent: "Only a Guardian account can create learner profiles.",
  service_role_required:
    "Server setup incomplete: add SUPABASE_SERVICE_ROLE_KEY to .env.local (see .env.example).",
};

export default function ParentCreateChildPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; displayName: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null);
    setLoading(true);

    try {
      const res = await fetch("/api/parent/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });
      const data = (await res.json()) as {
        error?: string;
        child?: { email: string; displayName: string };
      };

      if (!res.ok) {
        setError(ERROR_MESSAGES[data.error ?? ""] ?? data.error ?? "Could not create profile.");
        return;
      }

      if (data.child) {
        setCreated(data.child);
        setDisplayName("");
        setEmail("");
        setPassword("");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>Add a learner</h2>
        <p className={styles.formLead}>
          Create a sign-in for your child. They will use this email and password at Account → Learner.
        </p>
        <form onSubmit={onSubmit}>
          <div className={styles.field}>
            <label htmlFor="displayName" className={styles.label}>
              Display name
            </label>
            <input
              id="displayName"
              className={styles.formInput}
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Maya"
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Sign-in email
            </label>
            <input
              id="email"
              type="email"
              className={styles.formInput}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maya+learn@family.com"
              autoComplete="off"
            />
            <p className={styles.hint}>Unique email per child.</p>
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.formInput}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {created && (
            <div className={styles.credentialBox}>
              <p>
                <strong>{created.displayName}</strong> is ready!
              </p>
              <p>
                Sign-in: <strong>{created.email}</strong>
              </p>
              <p>Child uses Account → Sign in → Learner tab.</p>
            </div>
          )}

          <button type="submit" className={`${styles.primaryBtn} ${styles.formSubmit}`} disabled={loading}>
            {loading ? "Creating…" : "Create learner"}
          </button>
        </form>
      </div>
    </>
  );
}
