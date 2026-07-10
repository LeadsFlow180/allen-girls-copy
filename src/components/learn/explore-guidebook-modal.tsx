"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flag,
  Gift,
  Play,
  Target,
  X,
} from "lucide-react";
import { EXPLORE, chunkyShadow } from "@/app/learn/explore/explore-theme";
import styles from "./explore-guidebook-modal.module.css";

const MISSIONS = [
  {
    title: "Start",
    subtitle: "Mission 1 · Hola warm-up",
    accent: EXPLORE.sky,
    icon: Play,
    guide: "Sara",
    bullets: [
      "Jump into a tiny story intro with the characters.",
      "Complete 5 easy taps to hear and spot greeting words.",
      'Focus on listening first and getting comfy with "Hola".',
    ],
  },
  {
    title: "Learn",
    subtitle: "Mission 2 · Core greetings",
    accent: EXPLORE.green,
    icon: BookOpen,
    guide: "Sara",
    bullets: [
      "Practice key hello and goodbye phrases in Spanish.",
      "Use visual cards, audio cues, and short prompts.",
      "Clear 5 questions to unlock the reward chest mission.",
    ],
  },
  {
    title: "Reward",
    subtitle: "Mission 3 · Reward chest",
    accent: EXPLORE.streak,
    icon: Gift,
    guide: "Maya",
    bullets: [
      "Open the chest and collect your mission reward.",
      "Earn XP plus playful greeting-themed stickers.",
      "This step is quick, fun, and low pressure.",
    ],
  },
  {
    title: "Practice",
    subtitle: "Mission 4 · Quick practice",
    accent: EXPLORE.purple,
    icon: Target,
    guide: "Maya",
    bullets: [
      "Review with mixed English and Spanish prompts.",
      "Finish 5 fast questions to lock the words in.",
      "Great re-entry point after a short break.",
    ],
  },
  {
    title: "Final boss",
    subtitle: "Mission 5 · Greetings boss quiz",
    accent: EXPLORE.pink,
    icon: Flag,
    guide: "Maya",
    bullets: [
      "Take 5 mixed boss questions from all previous steps.",
      "Checks whether greetings now feel automatic.",
      "Complete this to unlock progress to the next unit.",
    ],
  },
] as const;

const PAGE_COUNT = 1 + MISSIONS.length;

type ExploreGuidebookModalProps = {
  open: boolean;
  onClose: () => void;
};

function MissionPill({
  mission,
  index,
  active,
  onSelect,
}: {
  mission: (typeof MISSIONS)[number];
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = mission.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${mission.title}, mission ${index + 1}`}
      aria-current={active ? "step" : undefined}
      style={{
        border: active ? `2px solid ${mission.accent}` : "2px solid #e8e8e8",
        borderRadius: "0.85rem",
        padding: "0.45rem 0.5rem",
        background: active ? `${mission.accent}18` : "#fff",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.25rem",
        minWidth: 56,
        flex: "1 1 0",
        maxWidth: 72,
        transition: "border-color 0.15s ease, background 0.15s ease",
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: mission.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 3px 0 ${mission.accent}99`,
        }}
      >
        <Icon size={18} color="#fff" strokeWidth={2.5} />
      </span>
      <span
        className="font-nunito"
        style={{
          fontSize: "0.58rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: active ? mission.accent : "#888",
        }}
      >
        {mission.title}
      </span>
    </button>
  );
}

function MissionSlide({
  mission,
}: {
  mission: (typeof MISSIONS)[number];
}) {
  const Icon = mission.icon;
  const guideInitial = mission.guide === "Sara" ? "S" : "M"; 
  const guideGradient =
    mission.guide === "Sara"
      ? "radial-gradient(circle at 30% 20%,#bbf7d0,#22c55e 75%,#15803d)"
      : "radial-gradient(circle at 30% 20%,#bfdbfe,#60a5fa 75%,#2563eb)";

  return (
    <div
      className={`font-nunito ${styles.missionSlide}`}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 1.25rem",
        gap: "0.65rem",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `linear-gradient(180deg, ${mission.accent} 0%, ${mission.accent}dd 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...chunkyShadow(mission.accent, 4),
        }}
      >
        <Icon size={36} color="#fff" strokeWidth={2.5} />
      </motion.div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: guideGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 800,
            color: "#fff",
          }}
        >
          {guideInitial}
        </span>
        <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
          {mission.guide} · your guide
        </span>
      </div>

      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: mission.accent,
        }}
      >
        {mission.title}
      </span>
      <h3
        className="font-fredoka"
        style={{
          margin: 0,
          fontSize: "1.25rem",
          fontWeight: 800,
          color: "#111827",
          lineHeight: 1.25,
        }}
      >
        {mission.subtitle}
      </h3>
      <ul
        className={styles.missionBullets}
        style={{
          margin: "0.25rem 0 0",
          padding: 0,
          listStyle: "none",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
          textAlign: "left",
        }}
      >
        {mission.bullets.map((b) => (
          <li
            key={b}
            style={{
              fontSize: "0.84rem",
              color: "#4b5563",
              lineHeight: 1.45,
              paddingLeft: "1.1rem",
              position: "relative",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                color: mission.accent,
                fontWeight: 900,
              }}
            >
              •
            </span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExploreGuidebookModal({
  open,
  onClose,
}: ExploreGuidebookModalProps) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (open) setPage(0);
  }, [open]);

  if (!open) return null;

  const isIntro = page === 0;
  const missionIndex = page - 1;
  const mission = missionIndex >= 0 ? MISSIONS[missionIndex] : null;

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(PAGE_COUNT - 1, p + 1));

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="guidebook-title"
      className={styles.modalOverlay}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,23,42,0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={styles.modalShell}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 560,
          height: "min(520px, calc(100dvh - 2rem))",
          borderRadius: "1.5rem",
          background: "#ffffff",
          boxShadow:
            "0 24px 70px rgba(15,23,42,0.22), 0 0 0 1px rgba(148,163,184,0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* top accent bar */}
        <div
          aria-hidden
          style={{
            height: 5,
            flexShrink: 0,
            background: `linear-gradient(90deg, ${EXPLORE.green}, ${EXPLORE.sky}, ${EXPLORE.purple})`,
          }}
        />

        <header
          className={styles.modalHeader}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1rem 0.5rem",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: EXPLORE.purple,
              }}
            >
              Section 1 · Guidebook
            </p>
            <h2
              id="guidebook-title"
              className={`font-fredoka ${styles.modalTitle}`}
              style={{
                margin: "0.15rem 0 0",
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              {isIntro
                ? "Your first Spanish greetings"
                : mission?.subtitle ?? "Mission guide"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guidebook"
            className={`${styles.chipBtn} ${styles.closeBtn}`}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </header>

        {/* content — fixed height, no scroll */}
        <div
          className={styles.modalContent}
          style={{
            flex: 1,
            minHeight: 0,
            position: "relative",
            overflow: "hidden",
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(88,204,2,0.08) 0%, transparent 55%), #fafafa",
          }}
        >
          <AnimatePresence mode="wait">
            {isIntro ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
                className={`font-nunito ${styles.introSlide}`}
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.75rem 1.1rem 0.5rem",
                  gap: "0.65rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 30% 20%,#bbf7d0,#22c55e 75%,#15803d)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    S
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "#4b5563" }}>
                    Sara · your Spanish guide
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.88rem",
                    color: "#374151",
                    lineHeight: 1.5,
                    maxWidth: 400,
                  }}
                >
                  Five short missions in order: warm-up, core greetings, reward
                  chest, quick practice, and boss review. Tap a step below or
                  use Next to walk through each one.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "0.35rem",
                    width: "100%",
                    maxWidth: 400,
                    marginTop: "0.25rem",
                  }}
                >
                  {MISSIONS.map((m, i) => (
                    <MissionPill
                      key={m.title}
                      mission={m}
                      index={i}
                      active={false}
                      onSelect={() => setPage(i + 1)}
                    />
                  ))}
                </div>
                <p
                  style={{
                    margin: "0.35rem 0 0",
                    fontSize: "0.78rem",
                    color: "#14532d",
                    background: EXPLORE.greenLight,
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.75rem",
                    maxWidth: 400,
                    lineHeight: 1.4,
                  }}
                >
                  Tip: tap the glowing node on the path or Continue to jump into
                  your next mission anytime.
                </p>
              </motion.div>
            ) : mission ? (
              <motion.div
                key={`mission-${page}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
                style={{ height: "100%", display: "flex" }}
              >
                <MissionSlide mission={mission} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* footer nav — no scrollbar */}
        <footer className={styles.footer}>
          <div className={styles.dots}>
            {Array.from({ length: PAGE_COUNT }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={i === 0 ? "Overview" : `Mission ${i}`}
                onClick={() => setPage(i)}
                className={`${styles.dot} ${
                  i === page ? styles.dotActive : styles.dotIdle
                }`}
              />
            ))}
          </div>
          <div className={styles.navRow}>
            <button
              type="button"
              onClick={goPrev}
              disabled={page === 0}
              className={`${styles.chipBtn} ${styles.backBtn} font-nunito`}
            >
              <ChevronLeft size={18} strokeWidth={2.5} aria-hidden />
              Back
            </button>
            <button
              type="button"
              onClick={page === PAGE_COUNT - 1 ? onClose : goNext}
              className={`${styles.nextBtn} font-nunito`}
            >
              {page === PAGE_COUNT - 1 ? "Got it!" : "Next"}
              {page < PAGE_COUNT - 1 ? (
                <ChevronRight size={18} strokeWidth={2.5} aria-hidden />
              ) : null}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
