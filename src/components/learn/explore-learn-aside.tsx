"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Cloud, Flame, Lock, Trophy } from "lucide-react";

import leaderboardsIcon from "@/assets/images/learn/leaderboards.svg";
import dailyQuestIcon from "@/assets/images/learn/dailyQuest.svg";
import pointsIcon from "@/assets/images/learn/points.svg";
import { getDailyXpQuestProgress, getQuestPulse } from "@/lib/learn/quests-state";
import { LEADERBOARD_UNLOCK_LESSONS } from "@/lib/learn/leaderboard";
import { useLearnLeaderboard } from "@/lib/learn/use-learn-leaderboard";
import { useLearnProgress } from "@/lib/learn/use-learn-progress";

import { LeaderboardMiniList } from "./leaderboard-mini-list";
import styles from "./explore-learn-aside.module.css";

export type ExploreLearnAsideProps = {
  gems?: number;
  dailyQuestCurrent?: number;
  dailyQuestGoal?: number;
  lessonsUntilLeaderboard?: number;
};

export function ExploreLearnAside({
  gems: gemsOverride,
  dailyQuestCurrent: dailyCurrentOverride,
  dailyQuestGoal: dailyGoalOverride,
  lessonsUntilLeaderboard: lessonsOverride,
}: ExploreLearnAsideProps) {
  const router = useRouter();
  const { wallet, quests, snapshot } = useLearnProgress();
  const leaderboard = useLearnLeaderboard();
  const dailyXp = getDailyXpQuestProgress(quests);
  const readyQuests = getQuestPulse(quests);

  const gems = gemsOverride ?? wallet.gems;
  const dailyQuestCurrent = dailyCurrentOverride ?? dailyXp.current;
  const dailyQuestGoal = dailyGoalOverride ?? dailyXp.goal;
  const completedLessons =
    leaderboard.hydrated && !leaderboard.loading
      ? leaderboard.myCompletedLessons
      : (snapshot.completedLadderSteps ?? 0);
  const lessonsUntilLeaderboard =
    lessonsOverride ??
    (leaderboard.hydrated && !leaderboard.loading
      ? leaderboard.lessonsUntilUnlock
      : Math.max(0, LEADERBOARD_UNLOCK_LESSONS - completedLessons));
  const leaderboardUnlocked =
    leaderboard.hydrated && !leaderboard.loading
      ? leaderboard.unlocked
      : completedLessons >= LEADERBOARD_UNLOCK_LESSONS;

  const questPct = Math.min(
    100,
    dailyQuestGoal > 0 ? (dailyQuestCurrent / dailyQuestGoal) * 100 : 0,
  );

  return (
    <aside className={`${styles.aside} font-nunito`}>
      <p className={`${styles.asideTitle} font-fredoka`}>Side quests</p>

      <div className={styles.card}>
        <div className={`${styles.cardAccent} ${styles.accentPurple}`} aria-hidden />
        <div className={styles.body}>
          <div className={styles.leaderboardCardHead}>
            <div className={styles.row}>
              <div className={`${styles.iconTile} ${styles.iconPurple}`}>
                <Image
                  src={leaderboardsIcon}
                  alt=""
                  width={26}
                  height={26}
                  className={styles.iconImg}
                />
                {!leaderboardUnlocked ? (
                  <span className={styles.lockBadge} aria-hidden>
                    <Lock size={11} color="#64748b" strokeWidth={2.5} />
                  </span>
                ) : null}
              </div>
              <div className={styles.leaderboardHeadCopy}>
                {leaderboardUnlocked ? (
                  <>
                    <p className={styles.title}>Leaderboards unlocked!</p>
                    <p className={styles.subtitle}>
                      {leaderboard.myRank
                        ? `You are #${leaderboard.myRank} with ${completedLessons} lessons.`
                        : `You have ${completedLessons} completed lessons.`}
                    </p>
                    <span className={styles.badgeUnlocked}>
                      <Trophy size={12} strokeWidth={2.5} color="#15803d" />
                      Competing
                    </span>
                  </>
                ) : (
                  <>
                    <p className={styles.title}>Unlock Leaderboards!</p>
                    <p className={styles.subtitle}>
                      Complete {lessonsUntilLeaderboard} more lesson
                      {lessonsUntilLeaderboard === 1 ? "" : "s"} to start competing.
                    </p>
                    <span className={styles.badgeLocked}>
                      <Trophy size={12} strokeWidth={2.5} color="#94a3b8" />
                      Locked · {completedLessons}/{LEADERBOARD_UNLOCK_LESSONS}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => router.push("/learn/leaderboard")}
            >
              Full board
            </button>
          </div>

          <LeaderboardMiniList
            entries={leaderboard.entries}
            loading={!leaderboard.hydrated || leaderboard.loading}
            compact
          />
        </div>
      </div>

      <div className={styles.card}>
        <div className={`${styles.cardAccent} ${styles.accentOrange}`} aria-hidden />
        <div className={styles.body}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderTitle}>
              <div className={styles.iconSm}>
                <Image src={dailyQuestIcon} alt="" width={22} height={22} />
              </div>
              <p className={styles.headerLabel}>Daily Quest</p>
            </div>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => router.push("/learn/quests")}
            >
              {readyQuests > 0 ? `${readyQuests} claim!` : "View all"}
            </button>
          </div>
          <div className={styles.questRow}>
            <div className={styles.flameTile}>
              <Flame size={18} color="#fff" fill="#fff" strokeWidth={2} />
            </div>
            <div className={styles.questMeta}>
              <p className={styles.questLabel}>Earn {dailyQuestGoal} XP</p>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${questPct}%` }}
                />
              </div>
            </div>
            <span className={styles.questCount}>
              {dailyQuestCurrent} / {dailyQuestGoal}
            </span>
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.profileCard}`}>
        <div className={`${styles.cardAccent} ${styles.accentGreen}`} aria-hidden />
        <div className={styles.profileDecor} aria-hidden />
        <span className={styles.profileDecor2} aria-hidden>
          ✨
        </span>
        <div className={styles.body}>
          <div className={`${styles.iconTile} ${styles.iconCloud}`}>
            <Cloud size={24} color="#fff" strokeWidth={2.25} />
          </div>
          <p className={styles.profileTitle}>Complete your profile to sync progress.</p>
          <p className={styles.profileDesc}>
            Enable cloud save, personalized goals, and cross-device access.
          </p>
          <button
            type="button"
            className={`${styles.ctaBtn} ${styles.ctaGreen} font-fredoka`}
            onClick={() => router.push("/account")}
          >
            Complete profile
          </button>
        </div>
      </div>

      <div className={`${styles.card} ${styles.walletCard}`}>
        <div className={`${styles.cardAccent} ${styles.accentSky}`} aria-hidden />
        <div className={styles.body}>
          <div className={styles.walletRow}>
            <div className={`${styles.statPill} ${styles.pillGems}`}>
              <Image src={pointsIcon} alt="" width={22} height={22} />
              <span>{gems}</span>
              <span className={styles.pillLabel}>Gems</span>
            </div>
            <div className={`${styles.statPill} ${styles.pillPoints}`}>
              <Image src={pointsIcon} alt="" width={22} height={22} />
              <span className={styles.pillPointsValue}>Points</span>
            </div>
          </div>
          <p className={styles.walletNote}>Gems (demo only)</p>
        </div>
      </div>
    </aside>
  );
}
