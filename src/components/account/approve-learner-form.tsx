"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound, RefreshCw, UserCheck } from "lucide-react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

import family from "@/app/parent/family.module.css";
import styles from "./approve-learner-form.module.css";

const STEPS = [
  {
    icon: UserCheck,
    title: "Child signs up",
    text: "They create a learner account and see a waiting screen with their code.",
  },
  {
    icon: KeyRound,
    title: "You enter the code",
    text: "Type the 8-character code here to link them to your guardian account.",
  },
  {
    icon: RefreshCw,
    title: "They refresh",
    text: "After approval, they sign in again to unlock Learn and Rewards.",
  },
] as const;

export function ApproveLearnerForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserSupabaseClient();
  const trimmedCode = code.trim().toUpperCase();
  const codeReady = trimmedCode.length === 8;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!supabase) {
      setError("Accounts are not configured.");
      return;
    }

    if (!codeReady) {
      setError("Enter the full 8-character learner code.");
      return;
    }

    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc("approve_learner_by_code", {
      p_code: trimmedCode,
    });
    setLoading(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    const payload = data as { ok?: boolean; error?: string } | null;
    if (!payload?.ok) {
      if (payload?.error === "not_parent") {
        setError("Only a guardian account can approve learners.");
      } else if (payload?.error === "invalid_or_used_code") {
        setError("That code doesn't match, or this learner is already approved.");
      } else {
        setError("Something went wrong. Try again.");
      }
      return;
    }

    setSuccess(true);
    setCode("");
  }

  return (
    <section className={family.familyScreen} aria-labelledby="approve-code-title">
      <header className={family.screenHead}>
        <div className={family.screenHeadCopy}>
          <h1 id="approve-code-title" className={family.screenTitle}>
            Approve learner code
          </h1>
          <p className={family.screenLead}>
            Link a child who signed up on their own by entering the code from their waiting screen.
          </p>
        </div>
      </header>

      {!supabase && (
        <p className={styles.warn}>Configure Supabase in .env.local before approving learners.</p>
      )}

      <div className={styles.stepsPanel}>
        <p className={styles.stepsKicker}>How it works</p>
        <ol className={styles.stepsList}>
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className={styles.stepItem}>
                <span className={styles.stepNum} aria-hidden>
                  {index + 1}
                </span>
                <span className={styles.stepIconWrap} aria-hidden>
                  <Icon size={16} strokeWidth={2.25} />
                </span>
                <div className={styles.stepCopy}>
                  <p className={styles.stepTitle}>{step.title}</p>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={styles.codePanel}>
        <div className={styles.codePanelHead}>
          <span className={styles.codeIconWrap} aria-hidden>
            <KeyRound size={20} strokeWidth={2.25} />
          </span>
          <div>
            <p className={styles.codePanelTitle}>Enter learner code</p>
            <p className={styles.codePanelHint}>8 letters and numbers, shown on your child&apos;s waiting screen.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <label htmlFor="learner-code" className={family.label}>
            Learner code
          </label>
          <input
            id="learner-code"
            className={styles.codeInput}
            autoComplete="off"
            inputMode="text"
            spellCheck={false}
            maxLength={8}
            required
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
              setError(null);
              setSuccess(false);
            }}
            placeholder="A1B2C3D4"
            disabled={!supabase || loading}
            aria-describedby="code-length-hint"
          />
          <p id="code-length-hint" className={styles.codeLength}>
            {trimmedCode.length}/8 characters
          </p>

          {error && <p className={family.error}>{error}</p>}

          {success && (
            <div className={styles.successCard} role="status">
              <CheckCircle2 className={styles.successIcon} size={20} strokeWidth={2.25} aria-hidden />
              <div className={styles.successCopy}>
                <p className={styles.successTitle}>Learner approved</p>
                <p className={styles.successText}>
                  They can sign in and start learning. View their profile in Family or open Progress to
                  track activity.
                </p>
                <div className={styles.successLinks}>
                  <Link href="/parent/children" className={styles.successLinkPrimary}>
                    Family profiles
                  </Link>
                  <Link href="/parent/dashboard" className={styles.successLinkMuted}>
                    Progress dashboard
                  </Link>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`${family.primaryBtn} ${styles.submitBtn}`}
            disabled={loading || !supabase || !codeReady}
          >
            {loading ? "Approving…" : "Approve learner"}
          </button>
        </form>
      </div>

      <p className={styles.footerNote}>
        Prefer to create the account yourself?{" "}
        <Link href="/parent/children/new" className={styles.footerLink}>
          Add learner instead
        </Link>
      </p>
    </section>
  );
}
