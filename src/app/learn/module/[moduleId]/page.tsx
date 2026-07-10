"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getStepsForModule,
  applyWorldSkin,
  SUBJECT_META,
  type MissionStep,
} from "@/data/lms/mission-content";
import { getWorldContext } from "@/data/lms/worlds-context";

// ── Types ────────────────────────────────────────────────────────────────────
type StepState = "intro" | "question" | "evaluating" | "feedback" | "done";

type StepResult = {
  stepIndex: number;
  passed: boolean;
  score: number;
  feedback: string;
  pointsEarned: number;
  attempts: number;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function localKeywordScore(answer: string, keywords: string[]): number {
  if (!keywords.length) return 70;
  const a = answer.toLowerCase();
  const hits = keywords.filter((k) => a.includes(k.toLowerCase())).length;
  return Math.round((hits / keywords.length) * 100);
}

const WORLD_GRADIENTS: Record<string, string> = {
  "aqua-azul":       "linear-gradient(160deg, #0c4a6e 0%, #0369a1 50%, #164e63 100%)",
  "fossil-frontier": "linear-gradient(160deg, #78350f 0%, #92400e 50%, #451a03 100%)",
  "crystal-tundra":  "linear-gradient(160deg, #1e3a5f 0%, #0e7490 50%, #164e63 100%)",
  "around-the-way":  "linear-gradient(160deg, #14532d 0%, #166534 50%, #052e16 100%)",
  "futuria-world":   "linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #0f0a2e 100%)",
  "great-jade-jungle":"linear-gradient(160deg, #14532d 0%, #15803d 50%, #052e16 100%)",
  "kingdom-wild":    "linear-gradient(160deg, #3b1f0a 0%, #78350f 50%, #1a0a02 100%)",
  "nova-star-command":"linear-gradient(160deg, #0f0a2e 0%, #1a0a50 50%, #0e1a40 100%)",
  "legends-long-ago":"linear-gradient(160deg, #1c1917 0%, #44403c 50%, #0c0a09 100%)",
};

// ── SubComponents ─────────────────────────────────────────────────────────────
function SparkMessage({ text, emoji = "🤖" }: { text: string; emoji?: string }) {
  return (
    <div style={{
      display: "flex", gap: "0.75rem", alignItems: "flex-start",
      background: "rgba(255,255,255,0.1)", borderRadius: "1rem",
      padding: "1rem 1.25rem", marginBottom: "1.5rem",
      border: "1px solid rgba(255,255,255,0.2)",
    }}>
      <span style={{ fontSize: "1.75rem", flexShrink: 0 }}>{emoji}</span>
      <p className="font-nunito" style={{ color: "#fff", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
        {text}
      </p>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? ((current / total) * 100) : 0;
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
        <span className="font-nunito" style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem" }}>
          Mission Progress
        </span>
        <span className="font-nunito" style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem" }}>
          {current} / {total} skills
        </span>
      </div>
      <div style={{ height: "8px", background: "rgba(255,255,255,0.15)", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, #f5c518, #e8357a)",
          borderRadius: "999px", transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

function SubjectBadge({ subject }: { subject: MissionStep["subject"] }) {
  const meta = SUBJECT_META[subject];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.35rem",
      background: meta.bg, color: meta.color,
      borderRadius: "999px", padding: "0.25rem 0.75rem",
      fontSize: "0.75rem", fontWeight: 800,
      fontFamily: "var(--font-nunito, sans-serif)",
      textTransform: "uppercase", letterSpacing: "0.06em",
    }}>
      {meta.emoji} {meta.label}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ModulePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const moduleId = typeof params.moduleId === "string" ? params.moduleId : "1";
  const worldSlug = searchParams.get("world") ?? "around-the-way";

  const rawSteps = getStepsForModule(moduleId);
  const steps = rawSteps.map((s) => applyWorldSkin(s, worldSlug));
  const worldCtx = getWorldContext(worldSlug);

  const [stepIndex, setStepIndex] = useState(0);
  const [stepState, setStepState] = useState<StepState>("intro");
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [results, setResults] = useState<StepResult[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [currentPoints, setCurrentPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [missionComplete, setMissionComplete] = useState(false);
  const [moduleBonus, setModuleBonus] = useState(0);
  const [butterflies, setButterflies] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const currentStep = steps[stepIndex];

  // Check if logged in (for cloud save)
  useEffect(() => {
    fetch("/api/rewards/points")
      .then((r) => { if (r.ok) setIsLoggedIn(true); })
      .catch(() => {});
  }, []);

  const saveToCloud = useCallback(async (
    step: MissionStep,
    score: number,
    stepAttempts: number,
    passed: boolean,
  ) => {
    if (!isLoggedIn || !passed) return { pointsAwarded: 0, moduleComplete: false, moduleBonusPoints: 0, butterfliesEarned: [] };
    try {
      const res = await fetch("/api/mission/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          skillId: step.skillId,
          worldSlug,
          subject: step.subject,
          gateType: step.gateType,
          score,
          attempts: stepAttempts,
          allSkillIds: steps.map((s) => s.skillId),
        }),
      });
      if (res.ok) return await res.json() as {
        pointsAwarded: number; moduleComplete: boolean;
        moduleBonusPoints: number; butterfliesEarned: string[];
      };
    } catch { /* cloud save optional */ }
    return { pointsAwarded: 0, moduleComplete: false, moduleBonusPoints: 0, butterfliesEarned: [] };
  }, [isLoggedIn, moduleId, worldSlug, steps]);

  const handleSubmit = useCallback(async () => {
    if (!currentStep) return;
    setStepState("evaluating");

    let score = 0;
    let passed = false;

    if (currentStep.gateType === "crisis") {
      passed = selectedOption === currentStep.correctOption;
      score = passed ? 100 : 0;
    } else {
      // Discovery gate — use local keyword scoring first, then optionally AI
      score = localKeywordScore(answer, currentStep.expectedKeywords ?? []);
      passed = score >= 55;

      // Try AI gate evaluation for discovery
      try {
        const res = await fetch("/api/gates/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gateType: "discovery",
            prompt: currentStep.question,
            answer,
            expectedKeywords: currentStep.expectedKeywords ?? [],
            attemptCount: attempts,
            nickname: "Recruit",
          }),
        });
        if (res.ok) {
          const gateResult = await res.json() as { passed: boolean; score: number; feedback: string };
          passed = gateResult.passed;
          score = gateResult.score;
          setCurrentFeedback(gateResult.feedback);
        }
      } catch { /* fallback to local */ }
    }

    const base = currentStep.gateType === "crisis" ? 13 : 19;
    const pts = passed ? base + (attempts === 1 ? 6 : 0) : 0;

    if (!passed) {
      setCurrentFeedback(
        currentStep.gateType === "crisis"
          ? `Not quite! The right answer was ${currentStep.correctOption}. Try again — you've got this.`
          : "S.P.A.R.K. needs a bit more detail. Add more key ideas and try again.",
      );
      setCurrentPoints(0);
      setAttempts((a) => a + 1);
      setStepState("feedback");
      return;
    }

    // Passed — save to cloud
    const cloud = await saveToCloud(currentStep, score, attempts, passed);
    const earned = cloud.pointsAwarded || pts;

    setCurrentPoints(earned);
    setTotalPoints((p) => p + earned);

    if (!currentFeedback) {
      setCurrentFeedback(
        currentStep.gateType === "crisis"
          ? "Correct! Fast and precise — exactly what S.P.A.R.K. needs."
          : "Strong reasoning, Recruit. Mission signal confirmed.",
      );
    }

    setResults((prev) => [...prev, {
      stepIndex,
      passed: true,
      score,
      feedback: currentFeedback,
      pointsEarned: earned,
      attempts,
    }]);

    if (cloud.moduleComplete) {
      setModuleBonus(cloud.moduleBonusPoints);
      setButterflies(cloud.butterfliesEarned);
      setTotalPoints((p) => p + cloud.moduleBonusPoints);
    }

    setStepState("feedback");
  }, [currentStep, selectedOption, answer, attempts, stepIndex, currentFeedback, saveToCloud]);

  const handleNext = () => {
    if (stepIndex + 1 >= steps.length) {
      setMissionComplete(true);
      return;
    }
    setStepIndex((i) => i + 1);
    setStepState("intro");
    setAnswer("");
    setSelectedOption(null);
    setCurrentFeedback("");
    setCurrentPoints(0);
    setAttempts(1);
  };

  const handleRetry = () => {
    setAnswer("");
    setSelectedOption(null);
    setCurrentFeedback("");
    setStepState("question");
  };

  const bg = WORLD_GRADIENTS[worldSlug] ?? "linear-gradient(160deg, #0f0a2e 0%, #1a0a50 100%)";

  // ── Mission Complete Screen ──────────────────────────────────────────
  if (missionComplete || (steps.length > 0 && results.length >= steps.length)) {
    const skillsPassed = results.filter((r) => r.passed).length;
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
        <div style={{
          maxWidth: "560px", width: "100%",
          background: "rgba(255,255,255,0.07)", borderRadius: "2rem",
          border: "2px solid rgba(255,255,255,0.15)", padding: "2.5rem",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>🎉</p>
          <h1 className="font-fredoka" style={{ fontSize: "2rem", color: "#fff", marginBottom: "0.5rem" }}>
            Mission Complete!
          </h1>
          <p className="font-nunito" style={{ color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>
            {worldCtx?.missionTitle ?? "Module 1"} — {worldSlug.replace(/-/g, " ")}
          </p>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Skills", value: `${skillsPassed}/${steps.length}` },
              { label: "Points Earned", value: `${totalPoints}⭐` },
              { label: "Module Bonus", value: moduleBonus > 0 ? `+${moduleBonus}⭐` : "—" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "1rem",
              }}>
                <p className="font-fredoka" style={{ fontSize: "1.35rem", color: "#f5c518", margin: 0 }}>{s.value}</p>
                <p className="font-nunito" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {butterflies.length > 0 && (
            <div style={{
              background: "rgba(124,34,197,0.3)", border: "1px solid rgba(196,181,253,0.4)",
              borderRadius: "1rem", padding: "1rem", marginBottom: "1.5rem",
            }}>
              <p className="font-fredoka" style={{ color: "#e9d5ff", fontSize: "1rem", marginBottom: "0.4rem" }}>
                🦋 New butterfly earned!
              </p>
              {butterflies.map((b) => (
                <p key={b} className="font-nunito" style={{ color: "#c4b5fd", fontSize: "0.85rem", margin: 0 }}>{b}</p>
              ))}
            </div>
          )}

          {/* Skill results */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
            {results.map((r, i) => {
              const step = steps[r.stepIndex];
              const meta = step ? SUBJECT_META[step.subject] : null;
              return (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "rgba(255,255,255,0.06)", borderRadius: "0.75rem", padding: "0.6rem 1rem",
                }}>
                  <span className="font-nunito" style={{ color: "#fff", fontSize: "0.82rem" }}>
                    {meta?.emoji} {meta?.label}
                  </span>
                  <span className="font-nunito" style={{ color: "#f5c518", fontWeight: 700, fontSize: "0.82rem" }}>
                    +{r.pointsEarned} pts
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              href={`/worlds/${worldSlug}`}
              style={{
                display: "block", padding: "0.85rem", borderRadius: "999px",
                background: "#f5c518", color: "#1a0a40", textDecoration: "none",
                fontFamily: "var(--font-fredoka, sans-serif)", fontSize: "1rem",
                fontWeight: 400,
              }}
            >
              🌍 Back to {worldSlug.replace(/-/g, " ")}
            </Link>
            <Link href="/learn" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", fontFamily: "var(--font-nunito, sans-serif)" }}>
              ← Kid World Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p className="font-nunito" style={{ color: "rgba(255,255,255,0.6)" }}>Module not found.</p>
          <Link href="/worlds" style={{ color: "#f5c518", fontWeight: 700 }}>← Choose a World</Link>
        </div>
      </div>
    );
  }

  const meta = SUBJECT_META[currentStep.subject];
  const lastResult = results[results.length - 1];

  // ── Mission Runner ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: bg }}>
      {/* Top bar */}
      <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "720px", margin: "0 auto" }}>
        <Link href={`/worlds/${worldSlug}`} className="font-nunito" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", textDecoration: "none" }}>
          ← Exit Mission
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(245,197,24,0.15)", borderRadius: "999px", padding: "0.3rem 0.9rem" }}>
          <span style={{ fontSize: "0.9rem" }}>⭐</span>
          <span className="font-fredoka" style={{ color: "#f5c518", fontSize: "1rem" }}>{totalPoints} pts</span>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        {/* Progress */}
        <ProgressBar current={results.filter((r) => r.passed).length} total={steps.length} />

        {/* World mission title */}
        {stepState === "intro" && (
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <p className="font-nunito" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>
              {worldSlug.replace(/-/g, " ")} · Module {moduleId}
            </p>
            <h1 className="font-fredoka" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", color: "#fff", margin: 0 }}>
              {worldCtx?.missionTitle ?? "Begin Your Mission"}
            </h1>
          </div>
        )}

        {/* Step card */}
        <div style={{
          background: "rgba(255,255,255,0.07)", borderRadius: "1.5rem",
          border: "1px solid rgba(255,255,255,0.15)", padding: "1.75rem",
        }}>
          {/* Subject badge + step counter */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <SubjectBadge subject={currentStep.subject} />
            <span className="font-nunito" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>
              Step {stepIndex + 1} of {steps.length}
            </span>
          </div>

          {/* Intro state */}
          {stepState === "intro" && (
            <>
              <SparkMessage text={currentStep.sparkIntro} />
              {currentStep.passage && (
                <div style={{
                  background: "rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "1.25rem",
                  marginBottom: "1.25rem", border: "1px solid rgba(255,255,255,0.15)",
                }}>
                  <p className="font-nunito" style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.92rem", lineHeight: 1.7, margin: 0 }}>
                    {currentStep.passage}
                  </p>
                </div>
              )}
              <button
                onClick={() => setStepState("question")}
                className="font-fredoka"
                style={{
                  width: "100%", padding: "0.9rem", borderRadius: "999px", border: "none",
                  background: "linear-gradient(90deg, #f5c518, #e8357a)",
                  color: "#fff", fontSize: "1.05rem", cursor: "pointer",
                }}
              >
                Ready — Start {currentStep.briefingTitle} →
              </button>
            </>
          )}

          {/* Question state */}
          {stepState === "question" && (
            <>
              <h2 className="font-fredoka" style={{ fontSize: "1.15rem", color: "#fff", marginBottom: "1.25rem", lineHeight: 1.4 }}>
                {currentStep.question}
              </h2>

              {currentStep.gateType === "crisis" && currentStep.options ? (
                /* Multiple choice */
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "1.5rem" }}>
                  {currentStep.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.id)}
                      className="font-nunito"
                      style={{
                        padding: "0.85rem 1.1rem", borderRadius: "0.85rem", border: "2px solid",
                        borderColor: selectedOption === opt.id ? "#f5c518" : "rgba(255,255,255,0.2)",
                        background: selectedOption === opt.id ? "rgba(245,197,24,0.15)" : "rgba(255,255,255,0.06)",
                        color: "#fff", textAlign: "left", cursor: "pointer", fontSize: "0.9rem",
                        display: "flex", gap: "0.75rem", alignItems: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{
                        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                        background: selectedOption === opt.id ? "#f5c518" : "rgba(255,255,255,0.15)",
                        color: selectedOption === opt.id ? "#1a0a40" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: "0.8rem",
                      }}>
                        {opt.id}
                      </span>
                      {opt.text}
                    </button>
                  ))}
                </div>
              ) : (
                /* Open response */
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here…"
                  rows={4}
                  className="font-nunito"
                  style={{
                    width: "100%", padding: "0.85rem 1rem", borderRadius: "0.85rem",
                    border: "2px solid rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.08)", color: "#fff",
                    fontSize: "0.95rem", lineHeight: 1.6, resize: "vertical",
                    boxSizing: "border-box", marginBottom: "1.25rem",
                  }}
                />
              )}

              <button
                onClick={() => void handleSubmit()}
                disabled={currentStep.gateType === "crisis" ? !selectedOption : answer.trim().length < 10}
                className="font-fredoka"
                style={{
                  width: "100%", padding: "0.9rem", borderRadius: "999px", border: "none",
                  background: "linear-gradient(90deg, #7c22c5, #a855f7)",
                  color: "#fff", fontSize: "1.05rem", cursor: "pointer",
                  opacity: (currentStep.gateType === "crisis" ? !selectedOption : answer.trim().length < 10) ? 0.5 : 1,
                }}
              >
                Submit Answer
              </button>
            </>
          )}

          {/* Evaluating state */}
          {stepState === "evaluating" && (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🤖</p>
              <p className="font-nunito" style={{ color: "rgba(255,255,255,0.7)" }}>
                S.P.A.R.K. is checking your answer…
              </p>
            </div>
          )}

          {/* Feedback state */}
          {stepState === "feedback" && (
            <>
              {/* Did they pass? */}
              {lastResult?.passed || (results.length > 0 && results[results.length - 1]?.stepIndex === stepIndex) ? (
                <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                  <p style={{ fontSize: "2rem", marginBottom: "0.35rem" }}>✅</p>
                  <p className="font-fredoka" style={{ color: "#86efac", fontSize: "1.2rem" }}>
                    Skill cleared! +{currentPoints} pts
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                  <p style={{ fontSize: "2rem", marginBottom: "0.35rem" }}>🔄</p>
                  <p className="font-fredoka" style={{ color: "#fca5a5", fontSize: "1.1rem" }}>
                    Not quite — let's try again.
                  </p>
                </div>
              )}

              {currentFeedback && (
                <SparkMessage text={currentFeedback} emoji="💬" />
              )}

              {/* Next or retry */}
              {lastResult?.passed || (results.length > 0 && results[results.length - 1]?.stepIndex === stepIndex) ? (
                <button
                  onClick={handleNext}
                  className="font-fredoka"
                  style={{
                    width: "100%", padding: "0.9rem", borderRadius: "999px", border: "none",
                    background: "linear-gradient(90deg, #16a34a, #15803d)",
                    color: "#fff", fontSize: "1.05rem", cursor: "pointer",
                  }}
                >
                  {stepIndex + 1 >= steps.length ? "Complete Mission 🎉" : "Next Skill →"}
                </button>
              ) : (
                <button
                  onClick={handleRetry}
                  className="font-fredoka"
                  style={{
                    width: "100%", padding: "0.9rem", borderRadius: "999px", border: "none",
                    background: "rgba(255,255,255,0.15)", color: "#fff",
                    fontSize: "1.05rem", cursor: "pointer", border: "2px solid rgba(255,255,255,0.3)" as never,
                  }}
                >
                  Try Again (Attempt {attempts})
                </button>
              )}
            </>
          )}
        </div>

        {/* Skill map mini-nav */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          {steps.map((s, i) => {
            const m = SUBJECT_META[s.subject];
            const isComplete = results.some((r) => r.stepIndex === i && r.passed);
            const isCurrent = i === stepIndex;
            return (
              <div key={i} style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: isComplete ? "#16a34a" : isCurrent ? "#f5c518" : "rgba(255,255,255,0.12)",
                border: `2px solid ${isComplete ? "#16a34a" : isCurrent ? "#f5c518" : "rgba(255,255,255,0.2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.9rem", title: m.label,
              }}>
                {isComplete ? "✓" : m.emoji}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
