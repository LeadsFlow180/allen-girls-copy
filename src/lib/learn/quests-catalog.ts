import type { AchievementProgressSnapshot } from "@/lib/learn/achievements-state";

export type QuestPeriod = "daily" | "weekly" | "monthly";

export type QuestMetricMode = "delta" | "absolute";

export type QuestDefinition = {
  id: string;
  period: QuestPeriod;
  title: string;
  description: string;
  emoji: string;
  metric: keyof AchievementProgressSnapshot;
  metricMode: QuestMetricMode;
  target: number;
  reward: { xp: number; gems: number };
  href: string;
  cta: string;
  accent: string;
};

export const QUESTS_CATALOG: QuestDefinition[] = [
  {
    id: "daily-earn-xp",
    period: "daily",
    title: "Earn 10 XP",
    description: "Complete lessons, quizzes, and claims to fill your XP bar.",
    emoji: "⚡",
    metric: "dailyXp",
    metricMode: "delta",
    target: 10,
    reward: { xp: 5, gems: 8 },
    href: "/learn/explore",
    cta: "Go to map",
    accent: "#ffc800",
  },
  {
    id: "daily-mission",
    period: "daily",
    title: "Finish a mission",
    description: "Clear one ladder step on your learning path today.",
    emoji: "🗺️",
    metric: "completedLadderSteps",
    metricMode: "delta",
    target: 1,
    reward: { xp: 8, gems: 12 },
    href: "/learn/explore",
    cta: "Open path",
    accent: "#58cc02",
  },
  {
    id: "daily-quiz",
    period: "daily",
    title: "Quiz champion",
    description: "Submit at least one quiz attempt today.",
    emoji: "🎯",
    metric: "quizAttempts",
    metricMode: "delta",
    target: 1,
    reward: { xp: 10, gems: 15 },
    href: "/learn/explore",
    cta: "Take quiz",
    accent: "#1cb0f6",
  },
  {
    id: "daily-slides",
    period: "daily",
    title: "Slide explorer",
    description: "Watch slides in the classroom adventure.",
    emoji: "📖",
    metric: "slidesViewedSession",
    metricMode: "delta",
    target: 3,
    reward: { xp: 6, gems: 10 },
    href: "/learn/explore",
    cta: "Explore",
    accent: "#a855f7",
  },
  {
    id: "daily-streak",
    period: "daily",
    title: "Keep the flame",
    description: "Show up today — your streak keeps the island alive.",
    emoji: "🔥",
    metric: "streakDays",
    metricMode: "absolute",
    target: 1,
    reward: { xp: 12, gems: 20 },
    href: "/learn/explore",
    cta: "Start lesson",
    accent: "#ff9600",
  },
  {
    id: "weekly-section",
    period: "weekly",
    title: "Section scout",
    description: "Push your section progress forward this week.",
    emoji: "🏔️",
    metric: "sectionPercent",
    metricMode: "absolute",
    target: 20,
    reward: { xp: 25, gems: 40 },
    href: "/learn/explore",
    cta: "Continue path",
    accent: "#22c55e",
  },
  {
    id: "weekly-quiz-hero",
    period: "weekly",
    title: "Quiz hero",
    description: "Land an 80%+ score on any quiz this week.",
    emoji: "🏆",
    metric: "highScoreQuizzes",
    metricMode: "delta",
    target: 1,
    reward: { xp: 30, gems: 50 },
    href: "/learn/explore",
    cta: "Beat your best",
    accent: "#eab308",
  },
  {
    id: "weekly-trophies",
    period: "weekly",
    title: "Badge hunter",
    description: "Unlock another trophy on Trophy Island.",
    emoji: "💎",
    metric: "claimedAchievements",
    metricMode: "delta",
    target: 1,
    reward: { xp: 20, gems: 35 },
    href: "/learn/achievements",
    cta: "Trophy Island",
    accent: "#7c3aed",
  },
  {
    id: "monthly-path",
    period: "monthly",
    title: "Path legend",
    description: "Reach halfway through your current section this month.",
    emoji: "👑",
    metric: "sectionPercent",
    metricMode: "absolute",
    target: 50,
    reward: { xp: 80, gems: 120 },
    href: "/learn/explore",
    cta: "Conquer section",
    accent: "#e8357a",
  },
  {
    id: "monthly-perfect",
    period: "monthly",
    title: "Perfect month",
    description: "Score 100% on any quiz during this month.",
    emoji: "✨",
    metric: "perfectQuizCount",
    metricMode: "delta",
    target: 1,
    reward: { xp: 100, gems: 150 },
    href: "/learn/explore",
    cta: "Go perfect",
    accent: "#06b6d4",
  },
];

export function questsForPeriod(period: QuestPeriod): QuestDefinition[] {
  return QUESTS_CATALOG.filter((q) => q.period === period);
}
