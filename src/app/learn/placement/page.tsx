"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";

import {
  getQuestionsBySection,
  placementIntro,
  placementSectionTitles,
  placementTierCopy,
  scorePlacement,
} from "@/data/lms/placement";
import type { PlacementQuestion, PlacementScoreResult } from "@/data/lms/placement";
import { pickRecommendedWorld } from "@/data/lms/mission-engine";
import { syncPlacementToCloud } from "@/lib/placement-cloud";
import { savePlacementResult } from "@/lib/placement-storage";
import type { DebriefResponse } from "@/app/api/placement/debrief/route";

type Phase = "intro" | "ela" | "math" | "results";

/** Only allow same-site relative paths (blocks open redirects). */
function safeInternalNextPath(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  return t;
}

function sanitizeDisplayName(raw: string): string {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return "Explorer";
  return t.slice(0, 32);
}

function PlacementPageContent() {
  const searchParams = useSearchParams();
  const nextAfterPlacement = useMemo(() => safeInternalNextPath(searchParams.get("next")), [searchParams]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [displayName, setDisplayName] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<PlacementScoreResult | null>(null);
  const [debrief, setDebrief] = useState<DebriefResponse | null>(null);
  const [debriefLoading, setDebriefLoading] = useState(false);

  const elaQs = useMemo(() => getQuestionsBySection("ela"), []);
  const mathQs = useMemo(() => getQuestionsBySection("math"), []);

  const [elaIndex, setElaIndex] = useState(0);
  const [mathIndex, setMathIndex] = useState(0);

  const nameForStory = sanitizeDisplayName(displayName);

  const finishMath = useCallback(() => {
    const next = scorePlacement(answers);
    savePlacementResult(nameForStory, next);
    void syncPlacementToCloud(nameForStory, next);
    setScore(next);
    setPhase("results");
  }, [answers, nameForStory]);

  const fallbackMission = score
    ? (() => {
        const w = pickRecommendedWorld(score.tier, nameForStory);
        return { missionSlug: w.slug, missionTitle: w.name, missionEmoji: w.emoji };
      })()
    : null;
  const effectiveMission = debrief ?? fallbackMission;

  // Fetch S.P.A.R.K. debrief from Claude whenever we enter results phase
  useEffect(() => {
    if (phase !== "results" || !score) return;
    setDebriefLoading(true);
    setDebrief(null);

    fetch("/api/placement/debrief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameForStory,
        elaPercent: score.elaPercent,
        mathPercent: score.mathPercent,
        overallPercent: score.overallPercent,
        tier: score.tier,
      }),
    })
      .then(async (r) => {
        if (!r.ok) return null;
        return (await r.json()) as DebriefResponse;
      })
      .then((data) => setDebrief(data))
      .catch(() => setDebrief(null))
      .finally(() => setDebriefLoading(false));
  }, [phase, score, nameForStory]);

  const currentEla = elaQs[elaIndex];
  const currentMath = mathQs[mathIndex];

  const pickEla = (idx: number) => {
    if (!currentEla) return;
    setAnswers((a) => ({ ...a, [currentEla.id]: idx }));
  };

  const pickMath = (idx: number) => {
    if (!currentMath) return;
    setAnswers((a) => ({ ...a, [currentMath.id]: idx }));
  };

  const nextEla = () => {
    if (!currentEla || answers[currentEla.id] === undefined) return;
    if (elaIndex < elaQs.length - 1) setElaIndex((i) => i + 1);
    else {
      setMathIndex(0);
      setPhase("math");
    }
  };

  const prevEla = () => {
    if (elaIndex > 0) setElaIndex((i) => i - 1);
  };

  const nextMath = () => {
    if (!currentMath || answers[currentMath.id] === undefined) return;
    if (mathIndex < mathQs.length - 1) setMathIndex((i) => i + 1);
    else finishMath();
  };

  const prevMath = () => {
    if (mathIndex > 0) setMathIndex((i) => i - 1);
    else {
      setElaIndex(elaQs.length - 1);
      setPhase("ela");
    }
  };

  const restart = () => {
    setPhase("intro");
    setAnswers({});
    setScore(null);
    setDebrief(null);
    setElaIndex(0);
    setMathIndex(0);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f9ff" }}>
      <div
        style={{
          maxWidth: "min(100%, 64rem)",
          margin: "0 auto",
          padding: "1.25rem clamp(1rem, 3vw, 2rem) 2rem",
        }}
      >
        <Link
          href="/learn"
          className="font-nunito"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#0369a1",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.95rem",
            marginBottom: "1rem",
          }}
        >
          <ArrowLeft style={{ width: "1.1rem", height: "1.1rem" }} />
          Back to Kid World
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            padding: "1.5rem 1rem",
            borderRadius: "1.25rem",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, var(--secondary) 100%)",
            color: "#fff",
            boxShadow: "0 12px 40px rgba(124,34,197,0.35)",
          }}
        >
          <p
            className="font-nunito"
            style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.95, margin: "0 0 0.5rem" }}
          >
            {placementIntro.eyebrow}
          </p>
          <h1 className="font-fredoka" style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", margin: "0 0 0.35rem", fontWeight: 400 }}>
            {placementIntro.title}
          </h1>
          <Sparkles style={{ width: "1.35rem", height: "1.35rem", display: "inline", verticalAlign: "middle", opacity: 0.95 }} />
        </motion.header>

        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.section
              key="intro"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              style={{
                background: "#fff",
                borderRadius: "1.25rem",
                padding: "1.75rem",
                border: "2px solid #bae6fd",
                boxShadow: "0 8px 28px rgba(3,105,161,0.08)",
              }}
            >
              <p className="font-nunito" style={{ fontSize: "1.05rem", lineHeight: 1.65, color: "#1e293b", margin: "0 0 1.25rem" }}>
                {placementIntro.introLead(nameForStory)}
              </p>

              <div
                style={{
                  marginBottom: "1.35rem",
                  padding: "1.1rem 1.15rem",
                  borderRadius: "1rem",
                  background: "linear-gradient(135deg, #ecfeff 0%, #e0f2fe 100%)",
                  border: "2px solid #06b6d4",
                }}
              >
                <h2 className="font-fredoka" style={{ fontSize: "1.05rem", color: "#0e7490", margin: "0 0 0.65rem", fontWeight: 400 }}>
                  {placementIntro.sparkBriefingTitle}
                </h2>
                <p className="font-nunito" style={{ fontSize: "0.95rem", lineHeight: 1.65, color: "#164e63", margin: 0 }}>
                  <span style={{ fontWeight: 800, color: "#0891b2" }}>S.P.A.R.K.</span>
                  {" — "}
                  <span style={{ fontStyle: "italic" }}>&ldquo;{placementIntro.sparkBriefingDialogue}&rdquo;</span>
                </p>
              </div>

              <label className="font-fredoka" style={{ display: "block", fontSize: "1rem", color: "#0c4a6e", marginBottom: "0.5rem" }}>
                {placementIntro.nameLabel}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={placementIntro.namePlaceholder}
                autoComplete="nickname"
                maxLength={32}
                className="font-nunito"
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  borderRadius: "0.75rem",
                  border: "2px solid #cbd5e1",
                  fontSize: "1rem",
                  marginBottom: "1.25rem",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setPhase("ela");
                  setElaIndex(0);
                }}
                className="font-fredoka"
                style={{
                  width: "100%",
                  padding: "0.95rem 1.25rem",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #facc15 0%, #fbbf24 100%)",
                  color: "#422006",
                  fontSize: "1.05rem",
                  boxShadow: "0 6px 20px rgba(245,197,24,0.45)",
                }}
              >
                {placementIntro.beginCta}
              </button>
            </motion.section>
          )}

          {phase === "ela" && currentEla && (
            <QuestionPanel
              key={`ela-${elaIndex}`}
              sectionTitle={placementSectionTitles.ela.title}
              sectionSubtitle={placementSectionTitles.ela.subtitle}
              questionIndex={elaIndex}
              totalInSection={elaQs.length}
              q={currentEla}
              selected={answers[currentEla.id]}
              onPick={pickEla}
              onNext={nextEla}
              onBack={elaIndex > 0 ? prevEla : undefined}
              accentBorder="#a855f7"
              accentSoft="#f3e8ff"
            />
          )}

          {phase === "math" && currentMath && (
            <QuestionPanel
              key={`math-${mathIndex}`}
              sectionTitle={placementSectionTitles.math.title}
              sectionSubtitle={placementSectionTitles.math.subtitle}
              questionIndex={mathIndex}
              totalInSection={mathQs.length}
              q={currentMath}
              selected={answers[currentMath.id]}
              onPick={pickMath}
              onNext={nextMath}
              onBack={prevMath}
              accentBorder="#22c55e"
              accentSoft="#dcfce7"
            />
          )}

          {phase === "results" && score && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: "#fff",
                borderRadius: "1.25rem",
                padding: "1.75rem",
                border: "2px solid #bae6fd",
                boxShadow: "0 8px 28px rgba(3,105,161,0.08)",
              }}
            >
              {/* Tier badge + title */}
              <p className="font-nunito" style={{ color: "#64748b", fontSize: "0.9rem", margin: "0 0 0.5rem" }}>
                {nameForStory}, here&rsquo;s your mission profile:
              </p>
              <p
                style={{
                  display: "inline-block",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, #e0f2fe, #dbeafe)",
                  color: "#1e293b",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                }}
              >
                {placementTierCopy[score.tier].badge}
              </p>
              <h2 className="font-fredoka" style={{ fontSize: "1.35rem", color: "#0f172a", margin: "0 0 0.75rem", fontWeight: 400 }}>
                {placementTierCopy[score.tier].title}
              </h2>

              {/* S.P.A.R.K. debrief panel */}
              <div
                style={{
                  margin: "0 0 1.35rem",
                  padding: "1.1rem 1.15rem",
                  borderRadius: "1rem",
                  background: "linear-gradient(135deg, #ecfeff 0%, #e0f2fe 100%)",
                  border: "2px solid #06b6d4",
                  minHeight: "5rem",
                }}
              >
                <p className="font-nunito" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0891b2", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
                  S.P.A.R.K. Debrief
                </p>
                {debriefLoading ? (
                  <SparkTyping />
                ) : debrief ? (
                  <p className="font-nunito" style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#164e63", margin: 0, whiteSpace: "pre-line" }}>
                    <span style={{ fontWeight: 800, color: "#0891b2" }}>S.P.A.R.K.</span>
                    {" — "}
                    <span style={{ fontStyle: "italic" }}>&ldquo;{debrief.debrief}&rdquo;</span>
                  </p>
                ) : (
                  <p className="font-nunito" style={{ fontSize: "0.95rem", lineHeight: 1.65, color: "#475569", margin: 0 }}>
                    {placementTierCopy[score.tier].body}
                  </p>
                )}
              </div>

              {/* Score bars */}
              <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <ScoreBar label="Reading & language" percent={score.elaPercent} color="#a855f7" />
                <ScoreBar label="Math" percent={score.mathPercent} color="#22c55e" />
                <p className="font-nunito" style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
                  Overall: {score.totalCorrect} / {score.totalQuestions} correct ({score.overallPercent}%)
                </p>
              </div>

              {/* Mission recommendation — from galaxy map we send ?next=/worlds so learners pick on the map */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {nextAfterPlacement === "/worlds" ? (
                  <>
                    <Link
                      href="/worlds"
                      className="font-fredoka"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        padding: "0.9rem 1.25rem",
                        borderRadius: "999px",
                        background: "linear-gradient(135deg, #7c22c5, #a855f7)",
                        color: "#fff",
                        textDecoration: "none",
                        fontSize: "1rem",
                        boxShadow: "0 8px 24px rgba(124,34,197,0.35)",
                      }}
                    >
                      Choose your world on the map
                      <ChevronRight style={{ width: "1.1rem", height: "1.1rem" }} />
                    </Link>
                    {effectiveMission ? (
                      <Link
                        href={`/worlds/${effectiveMission.missionSlug}`}
                        className="font-nunito"
                        style={{
                          textAlign: "center",
                          color: "#0369a1",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                        }}
                      >
                        Or try your suggested world: {effectiveMission.missionEmoji} {effectiveMission.missionTitle}
                      </Link>
                    ) : null}
                  </>
                ) : effectiveMission ? (
                  <Link
                    href={`/worlds/${effectiveMission.missionSlug}`}
                    className="font-fredoka"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.9rem 1.25rem",
                      borderRadius: "999px",
                      background: "linear-gradient(135deg, #7c22c5, #a855f7)",
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: "1rem",
                      boxShadow: "0 8px 24px rgba(124,34,197,0.35)",
                    }}
                  >
                    {effectiveMission.missionEmoji} Start: {effectiveMission.missionTitle}
                    <ChevronRight style={{ width: "1.1rem", height: "1.1rem" }} />
                  </Link>
                ) : (
                  <Link
                    href="/worlds"
                    className="font-fredoka"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.9rem 1.25rem",
                      borderRadius: "999px",
                      background: "linear-gradient(135deg, #7c22c5, #a855f7)",
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: "1rem",
                      boxShadow: "0 8px 24px rgba(124,34,197,0.35)",
                    }}
                  >
                    Choose your world
                    <ChevronRight style={{ width: "1.1rem", height: "1.1rem" }} />
                  </Link>
                )}
                <Link
                  href="/learn"
                  className="font-nunito"
                  style={{
                    textAlign: "center",
                    color: "#0369a1",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  }}
                >
                  Back to Kid World
                </Link>
                <button
                  type="button"
                  onClick={restart}
                  className="font-nunito"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Retake assessment
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PlacementPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <p className="font-nunito" style={{ color: "#0369a1", fontWeight: 700 }}>
            Loading your check-in…
          </p>
        </div>
      }
    >
      <PlacementPageContent />
    </Suspense>
  );
}

/** Animated "S.P.A.R.K. is analyzing..." placeholder while Claude responds. */
function SparkTyping() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span className="font-nunito" style={{ fontSize: "0.95rem", color: "#0891b2", fontWeight: 700 }}>
        S.P.A.R.K. is analyzing your signal
      </span>
      <span style={{ display: "flex", gap: "3px", alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#0891b2",
              display: "inline-block",
              animation: "sparkPulse 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </span>
      <style>{`
        @keyframes sparkPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function ScoreBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div>
      <div className="font-nunito" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#475569", marginBottom: "0.25rem" }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700 }}>{percent}%</span>
      </div>
      <div style={{ height: "10px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden" }}>
        <div style={{ width: `${percent}%`, height: "100%", borderRadius: "999px", background: color, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function QuestionPanel({
  sectionTitle,
  sectionSubtitle,
  questionIndex,
  totalInSection,
  q,
  selected,
  onPick,
  onNext,
  onBack,
  accentBorder,
  accentSoft,
}: {
  sectionTitle: string;
  sectionSubtitle: string;
  questionIndex: number;
  totalInSection: number;
  q: PlacementQuestion;
  selected: number | undefined;
  onPick: (idx: number) => void;
  onNext: () => void;
  onBack?: () => void;
  accentBorder: string;
  accentSoft: string;
}) {
  const canNext = selected !== undefined;
  const isLast = questionIndex === totalInSection - 1;

  return (
    <motion.section
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22 }}
      style={{
        background: "#fff",
        borderRadius: "1.25rem",
        padding: "1.75rem",
        border: `2px solid ${accentBorder}`,
        boxShadow: `0 8px 28px ${accentSoft}`,
      }}
    >
      <p className="font-fredoka" style={{ fontSize: "1.15rem", color: "#0f172a", margin: "0 0 0.25rem" }}>
        {sectionTitle}
      </p>
      <p className="font-nunito" style={{ fontSize: "0.9rem", color: "#64748b", margin: "0 0 1rem" }}>
        {sectionSubtitle}
      </p>
      <p className="font-nunito" style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0 0 1rem" }}>
        Question {questionIndex + 1} of {totalInSection}
      </p>

      {q.passage && q.passageTitle ? (
        <aside
          aria-label="Reading passage"
          className="font-nunito"
          style={{
            margin: "0 0 1.25rem",
            padding: "1rem 1.15rem",
            borderRadius: "0.85rem",
            border: `2px solid ${accentBorder}`,
            background: accentSoft,
            maxHeight: "min(52vh, 22rem)",
            overflowY: "auto",
          }}
        >
          <p className="font-fredoka" style={{ fontSize: "0.95rem", color: "#0f172a", margin: "0 0 0.65rem", fontWeight: 400 }}>
            Read this story: {q.passageTitle}
          </p>
          <div style={{ fontSize: "1rem", lineHeight: 1.65, color: "#334155", whiteSpace: "pre-line" }}>{q.passage}</div>
        </aside>
      ) : null}

      <p className="font-nunito" style={{ fontSize: "1.05rem", lineHeight: 1.6, color: "#1e293b", margin: "0 0 1.25rem" }}>
        {q.prompt}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
        {q.choices.map((choice, idx) => {
          const active = selected === idx;
          return (
            <button
              key={choice}
              type="button"
              onClick={() => onPick(idx)}
              className="font-nunito"
              style={{
                textAlign: "left",
                padding: "0.85rem 1rem",
                borderRadius: "0.75rem",
                border: active ? `2px solid ${accentBorder}` : "2px solid #e2e8f0",
                background: active ? accentSoft : "#f8fafc",
                cursor: "pointer",
                fontSize: "0.98rem",
                color: "#1e293b",
                fontWeight: active ? 700 : 500,
              }}
            >
              {choice}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="font-nunito"
            style={{
              padding: "0.85rem 1.25rem",
              borderRadius: "999px",
              border: "2px solid #cbd5e1",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              color: "#475569",
            }}
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="font-fredoka"
          style={{
            flex: 1,
            minWidth: "140px",
            padding: "0.85rem 1.25rem",
            borderRadius: "999px",
            border: "none",
            cursor: canNext ? "pointer" : "not-allowed",
            opacity: canNext ? 1 : 0.45,
            background: canNext ? "linear-gradient(135deg, #facc15 0%, #fbbf24 100%)" : "#e2e8f0",
            color: "#422006",
            fontSize: "1rem",
          }}
        >
          {isLast ? "See results" : "Next"}
        </button>
      </div>
    </motion.section>
  );
}
