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

/** Served from /public so Next never resizes/compresses the 4K PNG. */
const COMMAND_DECK_SRC = "/images/nova-command-deck.png?v=3840";

type Phase = "intro" | "ela" | "math" | "results";

  /** Shared holographic-console look so every panel feels projected from the deck table. */
const HOLO = {
  panelBg: "rgba(9, 18, 40, 0.88)",
  panelBorder: "1px solid rgba(94, 234, 212, 0.45)",
  panelGlow:
    "0 26px 70px rgba(2, 8, 24, 0.6), 0 0 44px rgba(45, 212, 218, 0.18), inset 0 1px 0 rgba(148, 233, 255, 0.18)",
  textPrimary: "#eaf6ff",
  textSecondary: "#a8cbe4",
  textMuted: "#7f9db8",
  cyan: "#38e1e8",
  cyanSoft: "rgba(56, 225, 232, 0.14)",
} as const;

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
    <div style={{ position: "relative", minHeight: "100vh", background: "#04091a", overflow: "hidden" }}>
      {/* Command-deck backdrop — Image fill (not CSS bg) so it never tiles */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- full 4K PNG, no optimizer resize */}
        <img
          src={COMMAND_DECK_SRC}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 48%",
          }}
        />
      </div>
      {/* Very light veil so text stays readable without dulling the room */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(4,9,26,0.35) 0%, rgba(4,9,26,0.1) 35%, rgba(4,9,26,0.12) 60%, rgba(4,9,26,0.4) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "min(100%, 48rem)",
          margin: "0 auto",
          padding: "1.25rem clamp(1rem, 3vw, 2rem) 3rem",
          color: HOLO.textPrimary,
        }}
      >
        <Link
          href="/worlds"
          className="font-nunito"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: HOLO.cyan,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.95rem",
            marginBottom: "1.25rem",
            textShadow: "0 0 12px rgba(56,225,232,0.5)",
          }}
        >
          <ArrowLeft style={{ width: "1.1rem", height: "1.1rem" }} />
          Back to worlds
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            padding: "0.5rem 1rem 1.25rem",
          }}
        >
          <p
            className="font-nunito"
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: HOLO.cyan,
              margin: "0 0 0.6rem",
              textShadow: "0 0 14px rgba(56,225,232,0.6)",
            }}
          >
            {placementIntro.eyebrow}
          </p>
          <h1
            className="font-fredoka"
            style={{
              fontSize: "clamp(1.7rem, 6vw, 2.5rem)",
              margin: "0 0 0.5rem",
              fontWeight: 400,
              color: "#fff",
              textShadow: "0 0 26px rgba(56,225,232,0.55), 0 2px 10px rgba(0,0,0,0.6)",
            }}
          >
            {placementIntro.title}
          </h1>
          <span
            aria-hidden
            style={{
              display: "block",
              width: "min(240px, 60%)",
              height: "2px",
              margin: "0.4rem auto 0",
              background: "linear-gradient(90deg, transparent, rgba(56,225,232,0.9), transparent)",
              boxShadow: "0 0 12px rgba(56,225,232,0.8)",
            }}
          />
          <Sparkles
            style={{ width: "1.3rem", height: "1.3rem", marginTop: "0.75rem", color: HOLO.cyan, filter: "drop-shadow(0 0 8px rgba(56,225,232,0.8))" }}
          />
        </motion.header>

        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.section
              key="intro"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3 }}
              style={{
                background: HOLO.panelBg,
                borderRadius: "1.25rem",
                padding: "1.75rem",
                border: HOLO.panelBorder,
                boxShadow: HOLO.panelGlow,
              }}
            >
              <p className="font-nunito" style={{ fontSize: "1.05rem", lineHeight: 1.7, color: HOLO.textPrimary, margin: "0 0 1.25rem" }}>
                {placementIntro.introLead(nameForStory)}
              </p>

              <div
                style={{
                  marginBottom: "1.35rem",
                  padding: "1.1rem 1.15rem",
                  borderRadius: "1rem",
                  background: "linear-gradient(135deg, rgba(56,225,232,0.14) 0%, rgba(37,99,235,0.14) 100%)",
                  border: "1px solid rgba(56,225,232,0.5)",
                  boxShadow: "inset 0 0 24px rgba(56,225,232,0.08)",
                }}
              >
                <h2 className="font-fredoka" style={{ fontSize: "1.05rem", color: HOLO.cyan, margin: "0 0 0.65rem", fontWeight: 400 }}>
                  {placementIntro.sparkBriefingTitle}
                </h2>
                <p className="font-nunito" style={{ fontSize: "0.95rem", lineHeight: 1.7, color: HOLO.textSecondary, margin: 0 }}>
                  <span style={{ fontWeight: 800, color: HOLO.cyan }}>S.P.A.R.K.</span>
                  {" — "}
                  <span style={{ fontStyle: "italic" }}>&ldquo;{placementIntro.sparkBriefingDialogue}&rdquo;</span>
                </p>
              </div>

              <label className="font-fredoka" style={{ display: "block", fontSize: "1rem", color: HOLO.textPrimary, marginBottom: "0.5rem" }}>
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
                  border: "1px solid rgba(94,234,212,0.4)",
                  background: "rgba(2,8,24,0.55)",
                  color: HOLO.textPrimary,
                  fontSize: "1rem",
                  marginBottom: "1.25rem",
                  boxSizing: "border-box",
                  outline: "none",
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
                  boxShadow: "0 6px 26px rgba(245,197,24,0.5)",
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
              accentSolid="#c084fc"
              accentBorder="rgba(192,132,252,0.6)"
              accentTint="rgba(192,132,252,0.18)"
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
              accentSolid="#4ade80"
              accentBorder="rgba(74,222,128,0.6)"
              accentTint="rgba(74,222,128,0.16)"
            />
          )}

          {phase === "results" && score && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: HOLO.panelBg,
                borderRadius: "1.25rem",
                padding: "1.75rem",
                border: HOLO.panelBorder,
                boxShadow: HOLO.panelGlow,
              }}
            >
              {/* Tier badge + title */}
              <p className="font-nunito" style={{ color: HOLO.textMuted, fontSize: "0.9rem", margin: "0 0 0.5rem" }}>
                {nameForStory}, here&rsquo;s your mission profile:
              </p>
              <p
                style={{
                  display: "inline-block",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "999px",
                  background: "rgba(56,225,232,0.16)",
                  border: "1px solid rgba(56,225,232,0.5)",
                  color: HOLO.cyan,
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                }}
              >
                {placementTierCopy[score.tier].badge}
              </p>
              <h2 className="font-fredoka" style={{ fontSize: "1.4rem", color: "#fff", margin: "0 0 0.75rem", fontWeight: 400, textShadow: "0 0 18px rgba(56,225,232,0.35)" }}>
                {placementTierCopy[score.tier].title}
              </h2>

              {/* S.P.A.R.K. debrief panel */}
              <div
                style={{
                  margin: "0 0 1.35rem",
                  padding: "1.1rem 1.15rem",
                  borderRadius: "1rem",
                  background: "linear-gradient(135deg, rgba(56,225,232,0.14) 0%, rgba(37,99,235,0.14) 100%)",
                  border: "1px solid rgba(56,225,232,0.5)",
                  boxShadow: "inset 0 0 24px rgba(56,225,232,0.08)",
                  minHeight: "5rem",
                }}
              >
                <p className="font-nunito" style={{ fontSize: "0.8rem", fontWeight: 700, color: HOLO.cyan, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
                  S.P.A.R.K. Debrief
                </p>
                {debriefLoading ? (
                  <SparkTyping />
                ) : debrief ? (
                  <p className="font-nunito" style={{ fontSize: "0.95rem", lineHeight: 1.7, color: HOLO.textSecondary, margin: 0, whiteSpace: "pre-line" }}>
                    <span style={{ fontWeight: 800, color: HOLO.cyan }}>S.P.A.R.K.</span>
                    {" — "}
                    <span style={{ fontStyle: "italic" }}>&ldquo;{debrief.debrief}&rdquo;</span>
                  </p>
                ) : (
                  <p className="font-nunito" style={{ fontSize: "0.95rem", lineHeight: 1.7, color: HOLO.textSecondary, margin: 0 }}>
                    {placementTierCopy[score.tier].body}
                  </p>
                )}
              </div>

              {/* Score bars */}
              <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <ScoreBar label="Reading & language" percent={score.elaPercent} color="#c084fc" />
                <ScoreBar label="Math" percent={score.mathPercent} color="#4ade80" />
                <p className="font-nunito" style={{ fontSize: "0.9rem", color: HOLO.textMuted, margin: 0 }}>
                  Overall: {score.totalCorrect} / {score.totalQuestions} correct ({score.overallPercent}%)
                </p>
              </div>

              {/* After galaxy-map intro: return to the world they clicked when possible */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {nextAfterPlacement && nextAfterPlacement.startsWith("/worlds/") ? (
                  <Link
                    href={nextAfterPlacement}
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
                      boxShadow: "0 8px 28px rgba(124,34,197,0.45)",
                    }}
                  >
                    Enter your chosen world
                    <ChevronRight style={{ width: "1.1rem", height: "1.1rem" }} />
                  </Link>
                ) : nextAfterPlacement === "/worlds" ? (
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
                        boxShadow: "0 8px 28px rgba(124,34,197,0.45)",
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
                          color: HOLO.cyan,
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
                      boxShadow: "0 8px 28px rgba(124,34,197,0.45)",
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
                      boxShadow: "0 8px 28px rgba(124,34,197,0.45)",
                    }}
                  >
                    Choose your world
                    <ChevronRight style={{ width: "1.1rem", height: "1.1rem" }} />
                  </Link>
                )}
                <Link
                  href="/worlds"
                  className="font-nunito"
                  style={{
                    textAlign: "center",
                    color: HOLO.cyan,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  }}
                >
                  Back to worlds
                </Link>
                <button
                  type="button"
                  onClick={restart}
                  className="font-nunito"
                  style={{
                    background: "none",
                    border: "none",
                    color: HOLO.textMuted,
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
        <div style={{ minHeight: "100vh", background: "#04091a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <p className="font-nunito" style={{ color: "#38e1e8", fontWeight: 700 }}>
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
      <span className="font-nunito" style={{ fontSize: "0.95rem", color: "#38e1e8", fontWeight: 700 }}>
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
              background: "#38e1e8",
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
      <div className="font-nunito" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: HOLO.textSecondary, marginBottom: "0.25rem" }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: "#fff" }}>{percent}%</span>
      </div>
      <div style={{ height: "10px", borderRadius: "999px", background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <div style={{ width: `${percent}%`, height: "100%", borderRadius: "999px", background: color, boxShadow: `0 0 12px ${color}`, transition: "width 0.4s ease" }} />
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
  accentSolid,
  accentBorder,
  accentTint,
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
  accentSolid: string;
  accentBorder: string;
  accentTint: string;
}) {
  const canNext = selected !== undefined;
  const isLast = questionIndex === totalInSection - 1;
  const progress = Math.round(((questionIndex + 1) / totalInSection) * 100);

  return (
    <motion.section
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22 }}
      style={{
        background: HOLO.panelBg,
        borderRadius: "1.25rem",
        padding: "1.75rem",
        border: `1px solid ${accentBorder}`,
        boxShadow: `0 26px 70px rgba(2,8,24,0.6), 0 0 40px ${accentTint}, inset 0 1px 0 rgba(148,233,255,0.15)`,
      }}
    >
      <p className="font-fredoka" style={{ fontSize: "1.2rem", color: accentSolid, margin: "0 0 0.25rem", textShadow: `0 0 16px ${accentTint}` }}>
        {sectionTitle}
      </p>
      <p className="font-nunito" style={{ fontSize: "0.9rem", color: HOLO.textSecondary, margin: "0 0 0.85rem" }}>
        {sectionSubtitle}
      </p>

      {/* Signal-progress meter */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: "0 0 1.15rem" }}>
        <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", borderRadius: "999px", background: accentSolid, boxShadow: `0 0 10px ${accentSolid}`, transition: "width 0.35s ease" }} />
        </div>
        <span className="font-nunito" style={{ fontSize: "0.75rem", color: HOLO.textMuted, whiteSpace: "nowrap" }}>
          Signal {questionIndex + 1} / {totalInSection}
        </span>
      </div>

      {q.passage && q.passageTitle ? (
        <aside
          aria-label="Reading passage"
          className="font-nunito"
          style={{
            margin: "0 0 1.25rem",
            padding: "1rem 1.15rem",
            borderRadius: "0.85rem",
            border: `1px solid ${accentBorder}`,
            background: accentTint,
            maxHeight: "min(52vh, 22rem)",
            overflowY: "auto",
          }}
        >
          <p className="font-fredoka" style={{ fontSize: "0.95rem", color: "#fff", margin: "0 0 0.65rem", fontWeight: 400 }}>
            Read this story: {q.passageTitle}
          </p>
          <div style={{ fontSize: "1rem", lineHeight: 1.7, color: HOLO.textPrimary, whiteSpace: "pre-line" }}>{q.passage}</div>
        </aside>
      ) : null}

      <p className="font-nunito" style={{ fontSize: "1.05rem", lineHeight: 1.6, color: HOLO.textPrimary, margin: "0 0 1.25rem" }}>
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
                border: active ? `1px solid ${accentBorder}` : "1px solid rgba(148,163,184,0.3)",
                background: active ? accentTint : "rgba(2,8,24,0.45)",
                cursor: "pointer",
                fontSize: "0.98rem",
                color: active ? "#fff" : HOLO.textPrimary,
                fontWeight: active ? 700 : 500,
                boxShadow: active ? `0 0 18px ${accentTint}` : "none",
                transition: "background 0.15s ease, border 0.15s ease",
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
              border: "1px solid rgba(148,163,184,0.4)",
              background: "rgba(2,8,24,0.5)",
              cursor: "pointer",
              fontWeight: 700,
              color: HOLO.textSecondary,
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
            opacity: canNext ? 1 : 0.4,
            background: canNext ? "linear-gradient(135deg, #facc15 0%, #fbbf24 100%)" : "rgba(255,255,255,0.12)",
            color: canNext ? "#422006" : HOLO.textMuted,
            fontSize: "1rem",
            boxShadow: canNext ? "0 6px 24px rgba(245,197,24,0.45)" : "none",
          }}
        >
          {isLast ? "See results" : "Next"}
        </button>
      </div>
    </motion.section>
  );
}
