"use client";

import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Brain, Calendar, CheckCircle2, ChevronRight, Target } from "lucide-react";

import type {
  LastQuizSummary,
  LearnQuizStats,
  QuizAttemptSummary,
} from "@/lib/learn/quiz-stats";

import styles from "./explore-quiz-stats.module.css";

type ExploreQuizStatsProps = {
  stats: LearnQuizStats;
  /** Fits inside a unit mission card */
  compact?: boolean;
};

type ScoreTier = "excellent" | "good" | "needsWork";

const MISSION_META: Record<string, { label: string; emoji: string }> = {
  lesson: { label: "Lesson", emoji: "📖" },
  start: { label: "Start", emoji: "🚀" },
  practice: { label: "Practice", emoji: "💪" },
  chest: { label: "Chest", emoji: "🎁" },
  quiz: { label: "Quiz", emoji: "🧠" },
  review: { label: "Review", emoji: "✨" },
};

function scoreTier(percent: number): ScoreTier {
  if (percent >= 80) return "excellent";
  if (percent >= 60) return "good";
  return "needsWork";
}

function formatMission(step: string | null) {
  if (!step) return { label: "Classroom", emoji: "🎓" };
  const key = step.toLowerCase();
  const meta = MISSION_META[key];
  if (meta) return meta;
  const label = step.charAt(0).toUpperCase() + step.slice(1);
  return { label, emoji: "🎯" };
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function heroLadderStep(
  lastQuiz: LastQuizSummary | null,
  latest: QuizAttemptSummary | null,
): string | null {
  return lastQuiz?.ladderStep ?? latest?.ladderStep ?? null;
}

function ScoreRing({
  percent,
  size = "md",
}: {
  percent: number;
  size?: "sm" | "md" | "lg";
}) {
  const tier = scoreTier(percent);
  return (
    <div
      className={`${styles.scoreRing} ${styles[`ringSize${size === "sm" ? "Sm" : size === "lg" ? "Lg" : "Md"}`]}`}
      data-tier={tier}
      style={
        {
          "--score-pct": `${Math.min(100, Math.max(0, percent))}`,
        } as CSSProperties
      }
      aria-hidden
    >
      <span className={`${styles.ringValue} font-fredoka`}>{percent}%</span>
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.statChip}>
      <span className={styles.statChipIcon} aria-hidden>
        {icon}
      </span>
      <div className={styles.statChipText}>
        <span className={`${styles.statChipLabel} font-nunito`}>{label}</span>
        <span className={`${styles.statChipValue} font-nunito`}>{value}</span>
      </div>
    </div>
  );
}

function AttemptRow({ attempt }: { attempt: QuizAttemptSummary }) {
  const tier = scoreTier(attempt.percent);
  const mission = formatMission(attempt.ladderStep);
  const accuracy =
    attempt.questionCount > 0
      ? Math.round((attempt.correctCount / attempt.questionCount) * 100)
      : attempt.percent;

  return (
    <li className={styles.attemptRow} data-tier={tier}>
      <div className={styles.attemptScore}>
        <span className={`${styles.attemptPercent} font-fredoka`}>
          {attempt.percent}%
        </span>
      </div>
      <div className={styles.attemptBody}>
        <div className={styles.attemptTop}>
          <span className={`${styles.missionChip} font-nunito`}>
            <span aria-hidden>{mission.emoji}</span>
            {mission.label}
          </span>
          <span className={`${styles.attemptDate} font-nunito`}>
            {formatDate(attempt.submittedAt)}
          </span>
        </div>
        <div className={styles.attemptBarTrack}>
          <div
            className={styles.attemptBarFill}
            style={{ width: `${accuracy}%` }}
          />
        </div>
        <p className={`${styles.attemptMeta} font-nunito`}>
          {attempt.correctCount}/{attempt.questionCount} correct
          {attempt.score > 0 || attempt.totalPoints > 0
            ? ` · ${attempt.score}/${attempt.totalPoints} pts`
            : null}
        </p>
      </div>
    </li>
  );
}

export function ExploreQuizStats({ stats, compact = false }: ExploreQuizStatsProps) {
  const { attemptsCount, lastQuiz, recentAttempts } = stats;
  if (attemptsCount === 0 && !lastQuiz) return null;

  const latestFromList = recentAttempts[0] ?? null;
  const hero = lastQuiz ?? latestFromList;
  const historyRows = recentAttempts.slice(1, 6);
  const showHistory = historyRows.length > 0;

  const stopBubble = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
  };

  if (compact) {
    if (!hero && attemptsCount === 0) return null;
    const mission = formatMission(heroLadderStep(lastQuiz, latestFromList));

    return (
      <p className={styles.compactLine} aria-label="Quiz attempts for this unit">
        {hero ? (
          <span className={styles.compactScore} data-tier={scoreTier(hero.percent)}>
            {hero.percent}%
          </span>
        ) : null}
        <span className="font-nunito">
          {attemptsCount} attempt{attemptsCount === 1 ? "" : "s"}
          {mission.label !== "Classroom" ? ` · ${mission.label}` : ""}
        </span>
      </p>
    );
  }

  const heroTier = hero ? scoreTier(hero.percent) : "good";
  const heroMission = formatMission(heroLadderStep(lastQuiz, latestFromList));

  return (
    <details
      className={styles.panel}
      aria-label="Quiz statistics"
      onClick={stopBubble}
      onKeyDown={stopBubble}
    >
      <summary className={`${styles.summary} font-nunito`}>
        <span className={styles.summaryIcon} aria-hidden>
          <Brain size={16} strokeWidth={2.25} />
        </span>
        <span className={styles.summaryText}>
          <span className={styles.summaryTitle}>Quiz performance</span>
          {hero ? (
            <span className={styles.summarySub}>
              Latest {hero.percent}% · {attemptsCount} attempt
              {attemptsCount === 1 ? "" : "s"}
            </span>
          ) : (
            <span className={styles.summarySub}>
              {attemptsCount} attempt{attemptsCount === 1 ? "" : "s"}
            </span>
          )}
        </span>
        {hero ? (
          <span className={`${styles.summaryPill} font-fredoka`} data-tier={heroTier}>
            {hero.percent}%
          </span>
        ) : null}
        <ChevronRight size={16} className={styles.summaryChevron} aria-hidden />
      </summary>

      <div className={styles.body}>
        {hero ? (
          <div className={styles.heroCard} data-tier={heroTier}>
            <ScoreRing percent={hero.percent} size="lg" />
            <div className={styles.heroContent}>
              <p className={`${styles.heroLabel} font-nunito`}>Latest attempt</p>
              <p className={`${styles.heroMission} font-fredoka`}>
                <span aria-hidden>{heroMission.emoji}</span> {heroMission.label}{" "}
                mission
              </p>
              <div className={styles.heroStats}>
                <StatChip
                  icon={<Target size={13} strokeWidth={2.5} />}
                  label="Score"
                  value={`${hero.score}/${hero.totalPoints} pts`}
                />
                <StatChip
                  icon={<CheckCircle2 size={13} strokeWidth={2.5} />}
                  label="Correct"
                  value={`${hero.correctCount}/${hero.questionCount}`}
                />
                {hero.submittedAt ? (
                  <StatChip
                    icon={<Calendar size={13} strokeWidth={2.5} />}
                    label="When"
                    value={formatDate(hero.submittedAt)}
                  />
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {showHistory ? (
          <div className={styles.historyBlock}>
            <p className={`${styles.historyHeading} font-nunito`}>
              Previous attempts
              <span className={styles.historyCount}>{historyRows.length}</span>
            </p>
            <ul className={styles.historyList}>
              {historyRows.map((attempt) => (
                <AttemptRow key={attempt.id} attempt={attempt} />
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </details>
  );
}
