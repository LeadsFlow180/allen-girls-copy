"use client";

import type { LeaderboardEntry } from "@/lib/learn/leaderboard";
import { avatarColorForUser, avatarInitial } from "@/lib/learn/leaderboard";

import styles from "./leaderboard-mini-list.module.css";

type Props = {
  entries: LeaderboardEntry[];
  loading?: boolean;
  compact?: boolean;
};

function rankTone(rank: number): string {
  if (rank === 1) return styles.rankGold;
  if (rank === 2) return styles.rankSilver;
  if (rank === 3) return styles.rankBronze;
  return "";
}

export function LeaderboardMiniList({ entries, loading = false, compact = false }: Props) {
  if (loading) {
    return <p className={styles.loading}>Loading rankings…</p>;
  }

  if (entries.length === 0) {
    return <p className={styles.empty}>No learners on the board yet.</p>;
  }

  return (
    <ul
      className={`${styles.list}${compact ? ` ${styles.listCompact}` : ""}`}
      aria-label="Learner rankings"
    >
      {entries.map((entry) => (
        <li
          key={entry.userId}
          className={`${styles.row}${entry.isCurrentUser ? ` ${styles.rowYou}` : ""}`}
        >
          <span className={`${styles.rank} ${rankTone(entry.rank)}`}>{entry.rank}</span>
          <span
            className={styles.avatar}
            style={{ background: avatarColorForUser(entry.userId) }}
            aria-hidden
          >
            {avatarInitial(entry.displayName)}
          </span>
          <span className={styles.name}>
            {entry.displayName}
            {entry.isCurrentUser ? <span className={styles.youTag}>You</span> : null}
          </span>
          <span className={styles.lessons}>{entry.completedLessons}</span>
        </li>
      ))}
    </ul>
  );
}
