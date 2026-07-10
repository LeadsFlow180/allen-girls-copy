"use client";

import { useMemo, useState, type ComponentType } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Crown,
  Flame,
  Gem,
  Medal,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import exploreGameBg from "@/assets/images/learn/explore-game-background.png";
import lockImg from "@/assets/images/learn/lock.svg";
import pointsIcon from "@/assets/images/learn/points.svg";
import streakIcon from "@/assets/images/learn/streak.svg";

import {
  ACHIEVEMENTS_CATALOG,
  type AchievementCategory,
  type AchievementIcon,
  type AchievementTier,
} from "@/lib/learn/achievements-catalog";
import {
  bumpLegacyStat,
  evaluateAchievements,
  saveClaimedIds,
  saveLocalWallet,
  type EvaluatedAchievement,
} from "@/lib/learn/achievements-state";
import { useLearnProgress } from "@/lib/learn/use-learn-progress";

import styles from "./achievements-hub.module.css";

const TIER_LABELS: Record<AchievementTier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

const HARD_TIERS: AchievementTier[] = ["gold", "platinum"];

const ICON_MAP: Record<
  AchievementIcon,
  ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
> = {
  target: Target,
  trophy: Trophy,
  medal: Medal,
  star: Star,
  zap: Zap,
  gem: Gem,
  crown: Crown,
  flame: Flame,
  book: BookOpen,
};

const STAR_POSITIONS = [
  { top: "18%", left: "12%" },
  { top: "28%", left: "78%" },
  { top: "14%", left: "45%" },
  { top: "35%", left: "22%" },
  { top: "40%", left: "88%" },
  { top: "52%", left: "8%" },
];

const BALLOON_POSITIONS = [
  { top: "18%", left: "8%", delay: "0s", duration: "14s", color: "#f97316" },
  { top: "24%", left: "82%", delay: "-3s", duration: "17s", color: "#22c55e" },
  { top: "44%", left: "16%", delay: "-7s", duration: "16s", color: "#e8357a" },
];

const CAR_POSITIONS = [
  { top: "72%", delay: "0s", duration: "20s", color: "#1cb0f6" },
  { top: "78%", delay: "-9s", duration: "24s", color: "#f59e0b" },
];

const CONFETTI_COLORS = ["#58cc02", "#ffc800", "#1cb0f6", "#ff4b4b", "#a855f7", "#ff9600"];

type TabKey = "all" | AchievementCategory;

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
      <div className={`${styles.cloud} ${styles.cloudC}`} />
      {STAR_POSITIONS.map((pos, i) => (
        <span
          key={i}
          className={styles.star}
          style={{
            ...pos,
            animationDelay: `${i * 0.35}s`,
          }}
        />
      ))}
      {BALLOON_POSITIONS.map((item, i) => (
        <span
          key={`balloon-${i}`}
          className={styles.balloon}
          style={{
            top: item.top,
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
            ["--balloon-color" as string]: item.color,
          }}
          aria-hidden
        >
          <span className={styles.balloonString} />
        </span>
      ))}
      {CAR_POSITIONS.map((item, i) => (
        <span
          key={`car-${i}`}
          className={styles.car}
          style={{
            top: item.top,
            animationDelay: item.delay,
            animationDuration: item.duration,
            ["--car-color" as string]: item.color,
          }}
          aria-hidden
        />
      ))}
      <div className={styles.hillBack} />
      <div className={styles.hillFront} />
    </div>
  );
}

function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.4,
    rotate: Math.random() * 360,
  }));

  return (
    <div className={styles.confettiLayer}>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className={styles.confettiPiece}
          style={{
            left: p.left,
            background: p.color,
            rotate: p.rotate,
          }}
          initial={{ y: -20, opacity: 1 }}
          animate={{ y: "110vh", opacity: 0 }}
          transition={{ duration: 2.2 + Math.random(), delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

function AchievementCard({
  item,
  onClaim,
}: {
  item: EvaluatedAchievement;
  onClaim: (id: string) => void;
}) {
  const Icon = ICON_MAP[item.icon];
  const isLocked = !item.unlocked && !item.claimed;
  const categoryLabel = item.category.charAt(0).toUpperCase() + item.category.slice(1);

  const cardClass = [
    styles.card,
    item.tier === "platinum" ? styles.cardPlatinum : "",
    item.claimed ? styles.cardClaimed : "",
    item.readyToClaim ? styles.cardReady : "",
    isLocked ? styles.cardLocked : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClass}>
      {isLocked ? (
        <div className={styles.lockOverlay}>
          <Image src={lockImg} alt="" className={styles.lockImg} width={40} height={40} />
        </div>
      ) : null}

      <div className={styles.cardInner}>
        <div className={styles.cardBanner}>
          <span className={`${styles.categoryPill} font-nunito`}>
            {categoryLabel}
          </span>
          <span className={`${styles.tierPill} font-nunito`}>{TIER_LABELS[item.tier]}</span>
        </div>

        <div className={styles.cardTop}>
          <div className={`${styles.iconWrap} ${styles[`tier_${item.tier}`]}`}>
            <Icon size={26} color="#fff" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className={`${styles.cardTitle} font-fredoka`}>
              {item.title}
              {HARD_TIERS.includes(item.tier) && !item.claimed ? (
                <span className={`${styles.hardBadge} font-nunito`}>HARD</span>
              ) : null}
            </h3>
            <p className={`${styles.cardDesc} font-nunito`}>{item.description}</p>
          </div>
        </div>

        <div className={styles.progressRow}>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${item.progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className={`${styles.progressLabel} font-nunito`}>
            {item.current}/{item.target}
          </span>
        </div>

        <div className={styles.progressMeta}>
          <span className={`${styles.progressMetaChip} font-nunito`}>
            {item.progressPercent}% complete
          </span>
          {item.readyToClaim ? (
            <span className={`${styles.progressMetaChip} ${styles.progressMetaReady} font-nunito`}>
              Ready to claim
            </span>
          ) : null}
        </div>

        <div className={styles.rewardRow}>
          <div className={styles.rewards}>
            <span className={`${styles.rewardChip} font-nunito`}>+{item.reward.xp} XP</span>
            <span className={`${styles.rewardChip} ${styles.rewardChipGem} font-nunito`}>
              +{item.reward.gems} 💎
            </span>
          </div>
          {item.claimed ? (
            <span className={`${styles.claimedBadge} font-nunito`}>⭐ Claimed!</span>
          ) : item.readyToClaim ? (
            <button
              type="button"
              data-ui-sound="claim"
              className={`${styles.claimBtn} font-nunito`}
              onClick={() => onClaim(item.id)}
            >
              Claim! 🎁
            </button>
          ) : (
            <span className={`${styles.lockedBadge} font-nunito`}>🔒 Keep going!</span>
          )}
        </div>
      </div>
    </article>
  );
}

function isAchievementVisible(
  item: EvaluatedAchievement,
  showAll: boolean,
): boolean {
  if (showAll) return true;
  if (item.readyToClaim || item.claimed) return true;
  if (item.current > 0) return true;
  return false;
}

export function AchievementsHub() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);

  const {
    hydrated,
    wallet,
    claimedIds,
    snapshot,
    refresh,
  } = useLearnProgress();

  const evaluated = useMemo(
    () => (hydrated ? evaluateAchievements(snapshot, claimedIds) : []),
    [hydrated, snapshot, claimedIds],
  );

  const filtered = useMemo(() => {
    const byTab =
      activeTab === "all"
        ? evaluated
        : evaluated.filter((a) => a.category === activeTab);
    return byTab.filter((a) => isAchievementVisible(a, showAll));
  }, [evaluated, activeTab, showAll]);

  const hiddenCount = useMemo(() => {
    if (!hydrated || showAll) return 0;
    const byTab =
      activeTab === "all"
        ? evaluated
        : evaluated.filter((a) => a.category === activeTab);
    return byTab.filter((a) => !isAchievementVisible(a, false)).length;
  }, [evaluated, activeTab, showAll, hydrated]);

  const catalogTotal = ACHIEVEMENTS_CATALOG.length;

  const stats = useMemo(() => {
    if (!hydrated) {
      return { unlocked: 0, ready: 0, total: catalogTotal };
    }
    const unlocked = evaluated.filter((a) => a.unlocked).length;
    const ready = evaluated.filter((a) => a.readyToClaim).length;
    return { unlocked, ready, total: evaluated.length };
  }, [evaluated, hydrated, catalogTotal]);

  const handleClaim = (id: string) => {
    const item = evaluated.find((a) => a.id === id);
    if (!item?.readyToClaim) return;

    const nextClaimed = [...claimedIds, id];
    const nextWallet = {
      xp: wallet.xp + item.reward.xp,
      gems: wallet.gems + item.reward.gems,
    };

    saveClaimedIds(nextClaimed);
    saveLocalWallet(nextWallet);
    bumpLegacyStat("dailyXp", item.reward.xp);
    window.dispatchEvent(new CustomEvent("learn:achievements-updated"));
    window.dispatchEvent(new CustomEvent("learn:quests-updated"));
    void refresh();
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2600);
    setToast(`🎉 ${item.title}! +${item.reward.xp} XP · +${item.reward.gems} gems`);
    setTimeout(() => setToast(null), 3500);
  };

  const tabs: { key: TabKey; label: string; emoji: string }[] = [
    { key: "all", label: "All quests", emoji: "🗺️" },
    { key: "daily", label: "Today", emoji: "☀️" },
    { key: "ladder", label: "Missions", emoji: "🪜" },
    { key: "unit", label: "Units", emoji: "📦" },
    { key: "section", label: "Sections", emoji: "🏔️" },
    { key: "quiz", label: "Quizzes", emoji: "🧠" },
    { key: "streak", label: "Streak", emoji: "🔥" },
    { key: "legend", label: "Legends", emoji: "👑" },
  ];

  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, { total: number; ready: number }> = {
      all: { total: 0, ready: 0 },
      daily: { total: 0, ready: 0 },
      ladder: { total: 0, ready: 0 },
      unit: { total: 0, ready: 0 },
      section: { total: 0, ready: 0 },
      quiz: { total: 0, ready: 0 },
      streak: { total: 0, ready: 0 },
      legend: { total: 0, ready: 0 },
    };
    if (!hydrated) {
      for (const def of ACHIEVEMENTS_CATALOG) {
        counts.all.total += 1;
        counts[def.category].total += 1;
      }
      return counts;
    }
    for (const a of evaluated) {
      counts.all.total += 1;
      if (a.readyToClaim) counts.all.ready += 1;
      const cat = a.category as AchievementCategory;
      counts[cat].total += 1;
      if (a.readyToClaim) counts[cat].ready += 1;
    }
    return counts;
  }, [evaluated, hydrated]);

  const rankPercent = stats.total
    ? Math.round((stats.unlocked / stats.total) * 100)
    : 0;

  const scrollToFirstReady = () => {
    const el = document.querySelector(`[data-ready-claim="true"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className={styles.page}>
      <WorldBackdrop />
      <ConfettiBurst active={confetti} />

      <div className={styles.content}>
        <section className={styles.heroDashboard}>
          <div className={styles.heroMain}>
            <div className={styles.stage}>
              <div className={styles.signBoard}>
                <p className={`${styles.signEyebrow} font-nunito`}>Allen Girls Adventures</p>
                <h1 className={styles.signTitle}>Trophy Island</h1>
                <p className={`${styles.signSub} font-nunito`}>
                  Win shiny badges, fill your treasure chest, and claim XP & gems in your
                  animated learning world!
                </p>
              </div>

              <div className={styles.pedestalWrap}>
                <div className={styles.pedestalGlow} aria-hidden />
                <motion.div
                  className={styles.trophyBounce}
                  animate={{ y: [0, -12, 0], rotate: [-4, 4, -4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Trophy size={72} color="#ffc800" fill="#fde047" strokeWidth={2} />
                </motion.div>
                <div className={styles.pedestal} />
              </div>
            </div>

            <div className={styles.marqueeRow}>
              <span className={`${styles.marqueeChip} font-nunito`}>🏆 Trophy Island</span>
              <span className={`${styles.marqueeChip} font-nunito`}>✨ Claim rewards</span>
              <span className={`${styles.marqueeChip} font-nunito`}>🎯 Mastery path</span>
              <span className={`${styles.marqueeChip} font-nunito`}>💎 Gem economy</span>
            </div>

            <div className={styles.rankBar}>
              <p className={`${styles.rankBarLabel} font-nunito`}>
                <span>🏆 Explorer rank</span>
                <span>
                  {stats.unlocked} / {stats.total} badges
                </span>
              </p>
              <div className={styles.rankBarTrack}>
                <motion.div
                  className={styles.rankBarFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${rankPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className={styles.orbRow}>
              <div className={`${styles.orb} ${styles.orbUnlock} font-nunito`}>
                <Trophy size={18} color="#5b21b6" />
                <span>
                  <strong>{stats.unlocked}</strong> / {stats.total} won
                </span>
              </div>
              {stats.ready > 0 ? (
                <div className={`${styles.orb} ${styles.orbReady} font-nunito`}>
                  <span>🎁</span>
                  <span>
                    <strong>{stats.ready}</strong> to claim!
                  </span>
                </div>
              ) : null}
              <div className={`${styles.orb} ${styles.orbXp} font-nunito`}>
                <Image src={pointsIcon} alt="" className={styles.orbIcon} width={22} height={22} />
                <span>
                  <strong>{wallet.xp}</strong> XP
                </span>
              </div>
              <div className={`${styles.orb} ${styles.orbGem} font-nunito`}>
                <Image src={streakIcon} alt="" className={styles.orbIcon} width={22} height={22} />
                <span>
                  <strong>{wallet.gems}</strong> gems
                </span>
              </div>
            </div>
          </div>

          <aside className={styles.heroAside}>
            <p className={`${styles.asideLabel} font-nunito`}>Command center</p>
            <h3 className={`${styles.asideTitle} font-fredoka`}>Your trophy momentum</h3>
            <div className={styles.asideStats}>
              <div className={styles.asideStat}>
                <span className={styles.asideStatKey}>Ready rewards</span>
                <strong>{stats.ready}</strong>
              </div>
              <div className={styles.asideStat}>
                <span className={styles.asideStatKey}>Completion</span>
                <strong>{rankPercent}%</strong>
              </div>
            </div>
            <button
              type="button"
              className={`${styles.asidePrimaryBtn} font-fredoka`}
              onClick={scrollToFirstReady}
              disabled={stats.ready === 0}
            >
              {stats.ready > 0 ? `Claim ${stats.ready} reward${stats.ready > 1 ? "s" : ""}` : "No rewards ready"}
            </button>
            <button
              type="button"
              className={`${styles.asideSecondaryBtn} font-nunito`}
              onClick={() => setActiveTab("all")}
            >
              Browse all categories
            </button>
          </aside>
        </section>

        <nav className={styles.tabDock} aria-label="Achievement categories">
          {tabs.map((tab) => {
            const c = tabCounts[tab.key];
            const hasReady = c.ready > 0;
            return (
              <button
                key={tab.key}
                type="button"
                className={`${styles.tab} font-nunito ${
                  activeTab === tab.key ? styles.tabActive : ""
                } ${hasReady && activeTab !== tab.key ? styles.tabReady : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.emoji} {tab.label}
                {c.total > 0 ? (
                  <span className={styles.tabCount}>
                    {hasReady ? c.ready : c.total}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className={styles.contentShell}>
          <div className={styles.viewToggleRow}>
            <p className={`${styles.viewToggleHint} font-nunito`}>
              {showAll
                ? "Showing every badge on the island."
                : "Focused view: in progress, ready to claim, and earned badges only."}
            </p>
            <button
              type="button"
              className={`${styles.viewToggleBtn} font-nunito`}
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll
                ? "Show fewer"
                : hiddenCount > 0
                  ? `Show all badges (+${hiddenCount} locked)`
                  : "Show all badges"}
            </button>
          </div>

          <div className={styles.grid}>
            {!hydrated ? (
              <p className={`${styles.emptyState} font-fredoka`}>
                Loading your trophies… ⏳
              </p>
            ) : filtered.length === 0 ? (
              <p className={`${styles.emptyState} font-fredoka`}>
                {showAll
                  ? "No badges here yet — keep adventuring! 🌈"
                  : "No active badges in this tab. Tap “Show all badges” to browse everything locked."}
              </p>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  data-ready-claim={item.readyToClaim ? "true" : undefined}
                >
                  <AchievementCard item={item} onClaim={handleClaim} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {stats.ready > 0 ? (
        <motion.button
          type="button"
          className={styles.treasureChest}
          aria-label={`${stats.ready} rewards ready to claim`}
          onClick={scrollToFirstReady}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          🎁
        </motion.button>
      ) : null}

      <AnimatePresence>
        {toast ? (
          <motion.p
            className={`${styles.toast} font-fredoka`}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
