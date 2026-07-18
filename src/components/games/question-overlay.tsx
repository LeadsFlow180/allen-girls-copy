"use client";

/**
 * Question Overlay — GAME-MASTER-SPEC §3 Mode A.
 * Covers/pauses any game and asks one content-bank question. The server picks
 * the question, grades it, and awards points; this component only displays.
 *
 * Flow: fetch question → student answers →
 *   correct  → celebrate (+points) → resume
 *   wrong    → hint, try again (up to 3 attempts) → teach → resume
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

import styles from "./question-overlay.module.css";

type ClientQuestion = {
  id: string;
  skillId: string;
  band: string;
  questionType: string;
  prompt: string;
  choices: string[];
};

type Phase = "loading" | "question" | "correct" | "hint" | "teach" | "error";

export type QuestionOverlayProps = {
  /** game_sessions.id from POST /api/games/session/start */
  sessionId: string;
  /** Accent color for buttons/glow (from the game catalog) */
  accent: string;
  /** Called when the question moment is over and the game should resume */
  onResume: (result: { answered: boolean; correct: boolean; pointsAwarded: number }) => void;
};

export function QuestionOverlay({ sessionId, accent, onResume }: QuestionOverlayProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [question, setQuestion] = useState<ClientQuestion | null>(null);
  const [attempt, setAttempt] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const askedIds = useRef<string[]>([]);
  const shownAt = useRef(Date.now());

  const loadQuestion = useCallback(async () => {
    setPhase("loading");
    setSelected(null);
    setAttempt(1);
    try {
      const res = await fetch("/api/games/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, excludeIds: askedIds.current }),
      });
      const data = await res.json();
      if (!res.ok || !data.question) throw new Error(data.error ?? "load_failed");
      askedIds.current = [...askedIds.current.slice(-20), data.question.id];
      setQuestion(data.question);
      shownAt.current = Date.now();
      setPhase("question");
    } catch {
      setPhase("error");
    }
  }, [sessionId]);

  useEffect(() => {
    void loadQuestion();
  }, [loadQuestion]);

  const submit = useCallback(async () => {
    if (selected === null || !question || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/games/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: question.id,
          choiceIndex: selected,
          attemptNumber: attempt,
          responseMs: Date.now() - shownAt.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "attempt_failed");

      if (data.correct) {
        setPoints(data.pointsAwarded ?? 0);
        setPhase("correct");
      } else if (data.teach) {
        setMessage(data.teach);
        setPhase("teach");
      } else {
        setMessage(data.hint ?? "Take another look and try again!");
        setAttempt((a) => a + 1);
        setSelected(null);
        setPhase("hint");
      }
    } catch {
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  }, [attempt, question, selected, sessionId, submitting]);

  const accentStyle = { "--qo-accent": accent } as React.CSSProperties;

  return (
    <div className={styles.backdrop} style={accentStyle} role="dialog" aria-modal="true">
      <div className={styles.card}>
        <div className={styles.header}>
          <Sparkles size={18} aria-hidden />
          <span>S.P.A.R.K. Signal Check</span>
        </div>

        {phase === "loading" && <p className={styles.status}>Tuning the signal…</p>}

        {phase === "error" && (
          <>
            <p className={styles.status}>The signal got fuzzy. Let&apos;s get back to the game!</p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => onResume({ answered: false, correct: false, pointsAwarded: 0 })}
            >
              Back to the game
            </button>
          </>
        )}

        {(phase === "question" || phase === "hint") && question && (
          <>
            {phase === "hint" && <p className={styles.hint}>{message}</p>}
            <p className={styles.prompt}>{question.prompt}</p>
            <div className={styles.choices}>
              {question.choices.map((choice, i) => (
                <button
                  key={choice}
                  type="button"
                  className={`${styles.choice} ${selected === i ? styles.choiceSelected : ""}`}
                  onClick={() => setSelected(i)}
                >
                  {choice}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={selected === null || submitting}
              onClick={() => void submit()}
            >
              {submitting ? "Checking…" : "Lock it in"}
            </button>
          </>
        )}

        {phase === "correct" && (
          <>
            <p className={styles.celebrate}>
              Signal locked! {points > 0 ? `+${points} points` : "Great work!"}
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => onResume({ answered: true, correct: true, pointsAwarded: points })}
            >
              Back to the game
            </button>
          </>
        )}

        {phase === "teach" && (
          <>
            <p className={styles.hint}>{message}</p>
            <p className={styles.status}>You&apos;ll get it next time — the adventure continues!</p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => onResume({ answered: true, correct: false, pointsAwarded: 0 })}
            >
              Back to the game
            </button>
          </>
        )}
      </div>
    </div>
  );
}
