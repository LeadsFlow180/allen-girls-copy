"use client";

import Image from "next/image";
import { ChevronLeft, Flame, Lock } from "lucide-react";
import { EXPLORE, chunkyShadow, pill3D } from "@/app/learn/explore/explore-theme";

import streakIcon from "@/assets/images/learn/streak.svg";
import lockIcon from "@/assets/images/learn/lock.svg";

import styles from "./explore-streak-panel.module.css";

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const SOCIETY_UNLOCK_DAYS = 7;

function mondayFirstTodayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function buildWeekState(streakDays: number) {
  const todayIdx = mondayFirstTodayIndex();
  const done = new Set<number>();

  if (streakDays > 0) {
    let idx = todayIdx;
    let left = Math.min(streakDays, 7);
    while (left > 0) {
      done.add(idx);
      left -= 1;
      idx = idx === 0 ? 6 : idx - 1;
    }
  }

  return { todayIdx, done };
}

export type ExploreStreakPanelProps = {
  streakDays?: number;
  onClose: () => void;
  onViewMore?: () => void;
};

export function ExploreStreakPanel({
  streakDays = 0,
  onClose,
  onViewMore,
}: ExploreStreakPanelProps) {
  const { todayIdx, done } = buildWeekState(streakDays);
  const societyProgress = Math.min(streakDays / SOCIETY_UNLOCK_DAYS, 1);
  const societyUnlocked = streakDays >= SOCIETY_UNLOCK_DAYS;

  return (
    <div className={`${styles.panel} font-nunito`}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={onClose}
          aria-label="Close streak panel"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          Back
        </button>

        <div className={styles.hero}>
          <div
            className={styles.flameBadge}
            style={chunkyShadow(EXPLORE.streakDark, 3)}
          >
            {streakDays > 0 ? (
              <Flame size={32} color="#fff" fill="#fff" strokeWidth={2} />
            ) : (
              <Image src={streakIcon} alt="" width={34} height={34} />
            )}
          </div>
          <div className={styles.heroText}>
            <p className={styles.streakCount}>{streakDays}</p>
            <p className={styles.streakLabel}>day streak</p>
          </div>
        </div>

        <p className={styles.cta}>
          {streakDays > 0
            ? "Keep it going — do a lesson today to protect your streak!"
            : "Do a lesson today to start a new streak!"}
        </p>

        <div className={styles.weekCard}>
          <div className={styles.weekRow}>
            <div className={styles.dayRow}>
              {WEEK_LABELS.map((label, index) => {
                const isDone = done.has(index);
                const isToday = index === todayIdx;
                return (
                  <div
                    key={`${label}-${index}`}
                    className={styles.dayCell}
                    aria-label={`${label}${isToday ? ", today" : ""}${isDone ? ", completed" : ""}`}
                  >
                    <span
                      className={styles.dayBubble}
                      data-done={isDone}
                      data-today={isToday && !isDone}
                    >
                      {isDone ? (
                        <Flame
                          size={14}
                          color="#fff"
                          fill="#fff"
                          strokeWidth={2}
                        />
                      ) : (
                        label
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className={styles.weekFlame} aria-hidden>
              <Image
                src={streakIcon}
                alt=""
                width={36}
                height={36}
                style={{
                  opacity: streakDays > 0 ? 1 : 0.35,
                  filter: streakDays > 0 ? "none" : "grayscale(1)",
                }}
              />
            </div>
          </div>

          <div className={styles.societyProgressWrap}>
            <div className={styles.societyProgressLabels}>
              <span>Streak Society</span>
              <span>
                {Math.min(streakDays, SOCIETY_UNLOCK_DAYS)}/{SOCIETY_UNLOCK_DAYS}
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${societyProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div
          className={styles.societyCard}
          data-unlocked={societyUnlocked}
        >
          <div className={styles.societyIcon}>
            {societyUnlocked ? (
              <Flame size={20} color={EXPLORE.streak} fill={EXPLORE.streak} />
            ) : (
              <Image src={lockIcon} alt="" width={20} height={20} />
            )}
          </div>
          <div>
            <p className={styles.societyTitle}>Streak Society</p>
            <p className={styles.societyDesc}>
              {societyUnlocked
                ? "You unlocked the Streak Society! Exclusive rewards are yours."
                : `Reach a ${SOCIETY_UNLOCK_DAYS} day streak to join the Streak Society and earn exclusive rewards.`}
            </p>
          </div>
          {!societyUnlocked && (
            <span className={styles.lockedPill}>
              <Lock size={11} strokeWidth={2.5} />
              Locked
            </span>
          )}
        </div>

        <button
          type="button"
          className={styles.viewMoreBtn}
          onClick={onViewMore}
          style={pill3D(EXPLORE.sky, EXPLORE.skyDark)}
        >
          VIEW MORE
        </button>
      </div>
    </div>
  );
}
