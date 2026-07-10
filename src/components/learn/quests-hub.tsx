"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  Flame,
  Sparkles,
  Swords,
  Timer,
} from "lucide-react";

import exploreGameBg from "@/assets/images/learn/explore-game-background.png";
import dailyQuestIcon from "@/assets/images/learn/dailyQuest.svg";
import pointsIcon from "@/assets/images/learn/points.svg";
import streakIcon from "@/assets/images/learn/streak.svg";

import {
  claimQuest,
  formatQuestCountdown,
  getDailyXpQuestProgress,
  getMsUntilDailyReset,
  type EvaluatedQuest,
} from "@/lib/learn/quests-state";
import { useLearnProgress } from "@/lib/learn/use-learn-progress";

import styles from "./quests-hub.module.css";

function WorldBackdrop() {
  return (
    <div className={styles.skyDecor} aria-hidden>
      <Image
        src={exploreGameBg}
        alt=""
        fill
        className={styles.worldBg}
        sizes="100vw"
        priority
      />
      <div className={styles.sun} />
      <div className={`${styles.cloud} ${styles.cloudA}`} />
      <div className={`${styles.cloud} ${styles.cloudB}`} />
      <div className={styles.hillBack} />
      <div className={styles.hillFront} />
    </div>
  );
}

function QuestCard({
  quest,
  onClaim,
  onGo,
}: {
  quest: EvaluatedQuest;
  onClaim: (id: string) => void;
  onGo: (href: string) => void;
}) {
  const done = quest.claimed;

  return (
    <motion.article
      className={`${styles.questCard} ${done ? styles.questCardDone : ""} ${
        quest.readyToClaim ? styles.questCardReady : ""
      }`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ "--quest-accent": quest.accent } as CSSProperties}
    >
      <div className={styles.questIconTile}>
        <span className={styles.questEmoji} aria-hidden>
          {quest.emoji}
        </span>
      </div>

      <div className={styles.questBody}>
        <div className={styles.questHead}>
          <h4 className={`${styles.questTitle} font-fredoka`}>{quest.title}</h4>
          <span className={`${styles.questPeriod} font-nunito`}>
            {quest.period}
          </span>
        </div>
        <p className={`${styles.questDesc} font-nunito`}>{quest.description}</p>

        <div className={styles.progressRow}>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${quest.progressPercent}%` }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </div>
          <span className={`${styles.progressLabel} font-nunito`}>
            {quest.current}/{quest.target}
          </span>
        </div>

        <div className={styles.questFoot}>
          <div className={`${styles.rewards} font-nunito`}>
            <span className={styles.rewardChip}>+{quest.reward.xp} XP</span>
            <span className={`${styles.rewardChip} ${styles.rewardGem}`}>
              +{quest.reward.gems} 💎
            </span>
          </div>
          {quest.claimed ? (
            <span className={`${styles.doneBadge} font-nunito`}>Claimed ✓</span>
          ) : quest.readyToClaim ? (
            <button
              type="button"
              data-ui-sound="claim"
              className={`${styles.claimBtn} font-fredoka`}
              onClick={() => onClaim(quest.id)}
            >
              Claim!
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.goBtn} font-nunito`}
              onClick={() => onGo(quest.href)}
            >
              {quest.cta}
              <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function QuestsHub() {
  const router = useRouter();
  const { loading, streakDays, wallet, snapshot, quests, refresh } =
    useLearnProgress();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    const tick = () => setCountdown(getMsUntilDailyReset());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const daily = useMemo(
    () => quests.filter((q) => q.period === "daily"),
    [quests],
  );
  const weekly = useMemo(
    () => quests.filter((q) => q.period === "weekly"),
    [quests],
  );
  const monthly = useMemo(
    () => quests.filter((q) => q.period === "monthly"),
    [quests],
  );

  const dailyXp = useMemo(() => getDailyXpQuestProgress(quests), [quests]);
  const readyCount = quests.filter((q) => q.readyToClaim).length;
  const doneToday = daily.filter((q) => q.claimed).length;

  const handleClaim = useCallback(
    (id: string) => {
      const result = claimQuest(id, snapshot);
      if (!result.ok || !result.quest) return;
      void refresh();
      setConfetti(true);
      window.setTimeout(() => setConfetti(false), 2400);
      setToast(
        `🎉 ${result.quest.title}! +${result.quest.reward.xp} XP · +${result.quest.reward.gems} gems`,
      );
      window.setTimeout(() => setToast(null), 3500);
    },
    [snapshot, refresh],
  );

  const monthlyHero = monthly[0];
  const monthlyPct = monthlyHero?.progressPercent ?? 0;

  return (
    <div className={styles.page}>
      <WorldBackdrop />
      {confetti ? <div className={styles.confettiBurst} aria-hidden /> : null}

      <div className={styles.content}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={`${styles.kicker} font-nunito`}>Quest Command</p>
            <h1 className={`${styles.heroTitle} font-fredoka`}>
              Daily Missions HQ
            </h1>
            <p className={`${styles.heroSub} font-nunito`}>
              Live goals tied to your map, quizzes, trophies, and streak — claim
              gems when you complete them.
            </p>
            <div className={`${styles.heroStats} font-nunito`}>
              <span className={styles.heroStat}>
                <Image src={streakIcon} alt="" width={18} height={18} />
                {streakDays} day streak
              </span>
              <span className={styles.heroStat}>
                <Image src={pointsIcon} alt="" width={18} height={18} />
                {wallet.gems} gems
              </span>
              <span className={styles.heroStat}>
                <Swords size={16} aria-hidden />
                {doneToday}/{daily.length} today
              </span>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <div className={styles.heroPanelIcon}>
              <Image src={dailyQuestIcon} alt="" width={52} height={52} />
            </div>
            <p className={`${styles.resetLabel} font-nunito`}>
              <Timer size={14} aria-hidden />
              Resets in
            </p>
            <p className={`${styles.resetTime} font-fredoka`}>
              {countdown === null ? "—" : formatQuestCountdown(countdown)}
            </p>
            <div className={styles.heroXpTrack}>
              <div
                className={styles.heroXpFill}
                style={{
                  width: `${Math.min(100, (dailyXp.current / dailyXp.goal) * 100)}%`,
                }}
              />
            </div>
            <p className={`${styles.heroXpLabel} font-nunito`}>
              Daily XP {dailyXp.current}/{dailyXp.goal}
            </p>
            {readyCount > 0 ? (
              <span className={`${styles.readyPill} font-nunito`}>
                <Sparkles size={12} aria-hidden />
                {readyCount} ready to claim
              </span>
            ) : null}
          </div>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={`${styles.sectionTitle} font-fredoka`}>
              <Flame size={20} color="#ff9600" aria-hidden />
              Today&apos;s quests
            </h2>
            <span className={`${styles.sectionMeta} font-nunito`}>
              {loading ? "Syncing…" : `${daily.filter((q) => q.unlocked).length} active`}
            </span>
          </div>
          <div className={styles.questGrid}>
            {daily.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                onClaim={handleClaim}
                onGo={(href) => router.push(href)}
              />
            ))}
          </div>
        </section>

        <div className={styles.splitRow}>
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={`${styles.sectionTitle} font-fredoka`}>
                <Calendar size={18} aria-hidden />
                This week
              </h2>
            </div>
            <div className={styles.questStack}>
              {weekly.map((q) => (
                <QuestCard
                  key={q.id}
                  quest={q}
                  onClaim={handleClaim}
                  onGo={(href) => router.push(href)}
                />
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.monthlySection}`}>
            <div className={styles.monthlyCard}>
              <p className={`${styles.monthlyKicker} font-nunito`}>Monthly epic</p>
              <h2 className={`${styles.monthlyTitle} font-fredoka`}>
                {monthlyHero?.emoji} {monthlyHero?.title ?? "Path legend"}
              </h2>
              <p className={`${styles.monthlyDesc} font-nunito`}>
                {monthlyHero?.description}
              </p>
              <div className={styles.monthlyTrack}>
                <motion.div
                  className={styles.monthlyFill}
                  animate={{ width: `${monthlyPct}%` }}
                />
              </div>
              <p className={`${styles.monthlyCount} font-nunito`}>
                {monthlyHero?.current ?? 0}/{monthlyHero?.target ?? 50}% section
              </p>
              <div className={styles.monthlyActions}>
                {monthlyHero?.readyToClaim ? (
                  <button
                    type="button"
                    className={`${styles.monthlyClaim} font-fredoka`}
                    onClick={() => monthlyHero && handleClaim(monthlyHero.id)}
                  >
                    Claim epic reward
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`${styles.monthlyGo} font-fredoka`}
                    onClick={() => router.push(monthlyHero?.href ?? "/learn/explore")}
                  >
                    Continue adventure
                  </button>
                )}
              </div>
              {monthly[1] ? (
                <div className={styles.monthlySub}>
                  <QuestCard
                    quest={monthly[1]}
                    onClaim={handleClaim}
                    onGo={(href) => router.push(href)}
                  />
                </div>
              ) : null}
            </div>

            <div className={styles.linkCards}>
              <button
                type="button"
                className={`${styles.linkCard} font-nunito`}
                onClick={() => router.push("/learn/explore")}
              >
                🗺️ Learning map
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                className={`${styles.linkCard} font-nunito`}
                onClick={() => router.push("/learn/achievements")}
              >
                🏆 Trophy Island
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                className={`${styles.linkCard} font-nunito`}
                onClick={() => router.push("/learn/courses")}
              >
                📚 Pick a course
                <ChevronRight size={16} />
              </button>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`${styles.toast} font-nunito`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
