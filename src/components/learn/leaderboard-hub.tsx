"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Lock, Medal, Trophy } from "lucide-react";

import leaderboardsIcon from "@/assets/images/learn/leaderboards.svg";
import { avatarColorForUser, avatarInitial } from "@/lib/learn/leaderboard";
import { useLearnLeaderboard } from "@/lib/learn/use-learn-leaderboard";

import styles from "./leaderboard-hub.module.css";

function rankClass(rank: number): string {
  if (rank === 1) return styles.rankGold;
  if (rank === 2) return styles.rankSilver;
  if (rank === 3) return styles.rankBronze;
  return "";
}

export function LeaderboardHub() {
  const {
    loading,
    hydrated,
    unlocked,
    unlockThreshold,
    myCompletedLessons,
    lessonsUntilUnlock,
    myRank,
    totalLearners,
    entries,
  } = useLearnLeaderboard();

  const unlockPct = useMemo(() => {
    if (unlocked) return 100;
    return Math.min(100, (myCompletedLessons / unlockThreshold) * 100);
  }, [myCompletedLessons, unlockThreshold, unlocked]);

  if (!hydrated || loading) {
    return <p className={styles.loading}>Loading leaderboard…</p>;
  }

  return (
    <div className={styles.leaderboardHub}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroTop}>
          <div>
            <h1 className={`${styles.heroTitle} font-fredoka`}>Leaderboard</h1>
            <p className={styles.heroSub}>
              See how every learner ranks by completed lessons. Finish missions on the map
              to climb the board.
            </p>
          </div>
          <span className={styles.trophyBadge}>
            <Trophy size={16} aria-hidden />
            {totalLearners} learners
          </span>
        </div>

        {!unlocked ? (
          <div className={styles.lockBanner}>
            <span className={styles.lockPill}>
              <Lock size={12} aria-hidden />
              Locked
            </span>
            <p>
              <strong>Unlock Leaderboards!</strong> Complete {lessonsUntilUnlock} more lesson
              {lessonsUntilUnlock === 1 ? "" : "s"} to start competing ({myCompletedLessons}/
              {unlockThreshold}).
            </p>
            <div
              style={{
                flex: "1 1 100%",
                height: 8,
                borderRadius: 999,
                background: "#e2e8f0",
                overflow: "hidden",
              }}
              role="progressbar"
              aria-valuenow={Math.round(unlockPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress to unlock leaderboards"
            >
              <div
                style={{
                  width: `${unlockPct}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #a855f7, #7c3aed)",
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        ) : null}

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Your lessons</p>
            <p className={styles.statValue}>{myCompletedLessons}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Your rank</p>
            <p className={styles.statValue}>{myRank ? `#${myRank}` : "—"}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>To unlock</p>
            <p className={styles.statValue}>
              {unlocked ? "Open!" : lessonsUntilUnlock}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.board} aria-label="All learners ranked by completed lessons">
        <div className={styles.boardHead}>
          <span>Rank</span>
          <span>Learner</span>
          <span>Lessons</span>
        </div>

        {entries.length === 0 ? (
          <p className={styles.empty}>No learners on the board yet. Be the first!</p>
        ) : (
          <ul className={styles.boardList}>
            {entries.map((entry) => (
              <li
                key={entry.userId}
                className={`${styles.row}${entry.isCurrentUser ? ` ${styles.rowYou}` : ""}`}
              >
                <span className={`${styles.rank} ${rankClass(entry.rank)}`}>
                  {entry.rank <= 3 ? <Medal size={16} aria-hidden /> : entry.rank}
                </span>
                <div className={styles.learner}>
                  <span
                    className={styles.avatar}
                    style={{ background: avatarColorForUser(entry.userId) }}
                    aria-hidden
                  >
                    {avatarInitial(entry.displayName)}
                  </span>
                  <p className={styles.name}>
                    {entry.displayName}
                    {entry.isCurrentUser ? (
                      <span className={styles.youTag}>You</span>
                    ) : null}
                  </p>
                </div>
                <span className={styles.lessons}>
                  {entry.completedLessons} lesson{entry.completedLessons === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p
        style={{
          margin: 0,
          textAlign: "center",
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "#64748b",
        }}
      >
        <Image
          src={leaderboardsIcon}
          alt=""
          width={18}
          height={18}
          style={{ verticalAlign: "middle", marginRight: 6 }}
        />
        Rankings update when missions are completed on the learning path.
      </p>
    </div>
  );
}
