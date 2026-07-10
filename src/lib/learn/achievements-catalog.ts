export type AchievementCategory =
  | "daily"
  | "ladder"
  | "unit"
  | "section"
  | "quiz"
  | "streak"
  | "legend";

export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export type AchievementIcon =
  | "target"
  | "trophy"
  | "medal"
  | "star"
  | "zap"
  | "gem"
  | "crown"
  | "flame"
  | "book";

export type AchievementReward = {
  xp: number;
  gems: number;
};

export type AchievementDefinition = {
  id: string;
  category: AchievementCategory;
  tier: AchievementTier;
  title: string;
  description: string;
  icon: AchievementIcon;
  reward: AchievementReward;
  target: number;
  /** Key used to read progress from AchievementProgressSnapshot */
  metric: string;
};

/** Applied when evaluating / claiming â€” keep at 1 unless you want bonus payouts. */
export const ACHIEVEMENT_REWARD_MULTIPLIER = 1;

export function scaledAchievementReward(
  reward: AchievementReward,
): AchievementReward {
  return {
    xp: Math.round(reward.xp * ACHIEVEMENT_REWARD_MULTIPLIER),
    gems: Math.round(reward.gems * ACHIEVEMENT_REWARD_MULTIPLIER),
  };
}

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  daily: "Daily missions",
  ladder: "Ladder missions",
  unit: "Unit milestones",
  section: "Section progress",
  quiz: "Quiz mastery",
  streak: "Streak power",
  legend: "Legend trophies",
};

export const ACHIEVEMENTS_CATALOG: AchievementDefinition[] = [
  // Daily
  {
    id: "daily-xp-10",
    category: "daily",
    tier: "bronze",
    title: "Warm-up spark",
    description: "Earn 10 XP from any lesson activity today.",
    icon: "zap",
    reward: { xp: 5, gems: 10 },
    target: 10,
    metric: "dailyXp",
  },
  {
    id: "daily-lesson-1",
    category: "daily",
    tier: "bronze",
    title: "First step today",
    description: "Complete one ladder mission in the classroom.",
    icon: "target",
    reward: { xp: 8, gems: 15 },
    target: 2,
    metric: "dailyMissions",
  },
  {
    id: "daily-slide-5",
    category: "daily",
    tier: "silver",
    title: "Slide explorer",
    description: "View 5 classroom slides in one session.",
    icon: "book",
    reward: { xp: 12, gems: 20 },
    target: 5,
    metric: "slidesViewedSession",
  },
  {
    id: "daily-xp-25",
    category: "daily",
    tier: "bronze",
    title: "Spark builder",
    description: "Earn 25 XP from lessons today.",
    icon: "zap",
    reward: { xp: 12, gems: 20 },
    target: 25,
    metric: "dailyXp",
  },

  // Ladder
  {
    id: "ladder-first",
    category: "ladder",
    tier: "bronze",
    title: "Mission starter",
    description: "Finish your first ladder step (Start mission).",
    icon: "medal",
    reward: { xp: 15, gems: 25 },
    target: 1,
    metric: "completedLadderSteps",
  },
  {
    id: "ladder-two",
    category: "ladder",
    tier: "bronze",
    title: "Double mission",
    description: "Complete 2 ladder missions in your unit.",
    icon: "medal",
    reward: { xp: 22, gems: 35 },
    target: 2,
    metric: "completedLadderSteps",
  },
  {
    id: "ladder-three",
    category: "ladder",
    tier: "silver",
    title: "Path finder",
    description: "Complete 3 ladder missions in one unit.",
    icon: "trophy",
    reward: { xp: 30, gems: 40 },
    target: 3,
    metric: "completedLadderSteps",
  },
  {
    id: "ladder-five",
    category: "ladder",
    tier: "gold",
    title: "Unit champion",
    description: "Complete all 5 ladder missions in a unit.",
    icon: "crown",
    reward: { xp: 50, gems: 75 },
    target: 5,
    metric: "completedLadderSteps",
  },

  // Unit / section
  {
    id: "unit-progress-25",
    category: "unit",
    tier: "bronze",
    title: "Unit starter",
    description: "Reach 25% progress on your current unit.",
    icon: "star",
    reward: { xp: 18, gems: 28 },
    target: 25,
    metric: "unitPercent",
  },
  {
    id: "unit-progress-50",
    category: "unit",
    tier: "bronze",
    title: "Halfway hero",
    description: "Reach 50% progress on your current unit.",
    icon: "star",
    reward: { xp: 20, gems: 30 },
    target: 35,
    metric: "unitPercent",
  },
  {
    id: "unit-complete-1",
    category: "unit",
    tier: "gold",
    title: "Greetings hero",
    description: "Fully complete Unit 1 (all 5 missions).",
    icon: "trophy",
    reward: { xp: 60, gems: 90 },
    target: 100,
    metric: "unitPercent",
  },
  {
    id: "section-5",
    category: "section",
    tier: "bronze",
    title: "Trail beginner",
    description: "Reach 5% progress across Section 1.",
    icon: "book",
    reward: { xp: 15, gems: 25 },
    target: 5,
    metric: "sectionPercent",
  },
  {
    id: "section-10",
    category: "section",
    tier: "bronze",
    title: "Section scout",
    description: "Reach 10% progress across Section 1 (10 units).",
    icon: "book",
    reward: { xp: 25, gems: 35 },
    target: 8,
    metric: "sectionPercent",
  },
  {
    id: "section-25",
    category: "section",
    tier: "silver",
    title: "Rising star",
    description: "Reach 25% progress across Section 1.",
    icon: "star",
    reward: { xp: 40, gems: 55 },
    target: 20,
    metric: "sectionPercent",
  },
  {
    id: "section-50",
    category: "section",
    tier: "gold",
    title: "Section master",
    description: "Reach 50% progress across Section 1.",
    icon: "crown",
    reward: { xp: 80, gems: 120 },
    target: 40,
    metric: "sectionPercent",
  },

  // Quiz
  {
    id: "quiz-first",
    category: "quiz",
    tier: "bronze",
    title: "Quiz debut",
    description: "Submit your first classroom quiz.",
    icon: "target",
    reward: { xp: 15, gems: 25 },
    target: 1,
    metric: "quizAttempts",
  },
  {
    id: "quiz-pass-40",
    category: "quiz",
    tier: "bronze",
    title: "Good start",
    description: "Score 40% or higher on any quiz.",
    icon: "medal",
    reward: { xp: 18, gems: 28 },
    target: 40,
    metric: "bestQuizPercent",
  },
  {
    id: "quiz-pass-60",
    category: "quiz",
    tier: "silver",
    title: "Solid score",
    description: "Score 60% or higher on any quiz.",
    icon: "medal",
    reward: { xp: 25, gems: 40 },
    target: 60,
    metric: "bestQuizPercent",
  },
  {
    id: "quiz-pass-80",
    category: "quiz",
    tier: "gold",
    title: "Quiz ace",
    description: "Score 80% or higher on any quiz.",
    icon: "trophy",
    reward: { xp: 45, gems: 70 },
    target: 80,
    metric: "bestQuizPercent",
  },
  {
    id: "quiz-perfect",
    category: "quiz",
    tier: "platinum",
    title: "Perfect mind",
    description: "Score 100% on a classroom quiz.",
    icon: "crown",
    reward: { xp: 100, gems: 150 },
    target: 100,
    metric: "bestQuizPercent",
  },
  {
    id: "quiz-three",
    category: "quiz",
    tier: "silver",
    title: "Quiz collector",
    description: "Attempt 3 quizzes in the classroom.",
    icon: "gem",
    reward: { xp: 35, gems: 50 },
    target: 4,
    metric: "quizAttempts",
  },

  // Streak
  {
    id: "streak-1",
    category: "streak",
    tier: "bronze",
    title: "Two-day spark",
    description: "Come back two days in a row.",
    icon: "flame",
    reward: { xp: 10, gems: 18 },
    target: 2,
    metric: "streakDays",
  },
  {
    id: "streak-3",
    category: "streak",
    tier: "bronze",
    title: "On a roll",
    description: "Maintain a 3-day learning streak.",
    icon: "flame",
    reward: { xp: 20, gems: 30 },
    target: 3,
    metric: "streakDays",
  },
  {
    id: "streak-7",
    category: "streak",
    tier: "gold",
    title: "Streak society",
    description: "Maintain a 7-day learning streak.",
    icon: "flame",
    reward: { xp: 50, gems: 80 },
    target: 7,
    metric: "streakDays",
  },

  // Legend trophies
  {
    id: "legend-resume",
    category: "legend",
    tier: "silver",
    title: "Comeback kid",
    description: "Resume a classroom where you left off.",
    icon: "star",
    reward: { xp: 20, gems: 35 },
    target: 1,
    metric: "hasResumed",
  },
  {
    id: "legend-classroom",
    category: "legend",
    tier: "platinum",
    title: "Allen adventurer",
    description: "Open the AI School classroom from Explore 5 times.",
    icon: "crown",
    reward: { xp: 30, gems: 60 },
    target: 5,
    metric: "classroomLaunches",
  },
  {
    id: "legend-languages-2",
    category: "legend",
    tier: "gold",
    title: "Language explorer",
    description: "Start learning 2 different languages.",
    icon: "trophy",
    reward: { xp: 40, gems: 65 },
    target: 2,
    metric: "languagesStarted",
  },

  // â€”â€” More daily & grind â€”â€”
  {
    id: "daily-xp-50",
    category: "daily",
    tier: "silver",
    title: "XP lightning",
    description: "Earn 50 XP from lessons in one day.",
    icon: "zap",
    reward: { xp: 20, gems: 35 },
    target: 30,
    metric: "dailyXp",
  },
  {
    id: "daily-missions-3",
    category: "daily",
    tier: "gold",
    title: "Triple threat",
    description: "Finish 3 ladder missions today.",
    icon: "flame",
    reward: { xp: 35, gems: 55 },
    target: 3,
    metric: "dailyMissions",
  },
  {
    id: "daily-slides-12",
    category: "daily",
    tier: "gold",
    title: "Slide sprint",
    description: "Watch 12 classroom slides in one session.",
    icon: "book",
    reward: { xp: 28, gems: 45 },
    target: 12,
    metric: "slidesViewedSession",
  },

  // â€”â€” Hard ladder / unit â€”â€”
  {
    id: "unit-progress-90",
    category: "unit",
    tier: "platinum",
    title: "Almost unstoppable",
    description: "Reach 90% progress on your current unit.",
    icon: "crown",
    reward: { xp: 90, gems: 140 },
    target: 90,
    metric: "unitPercent",
  },
  {
    id: "unit-slides-100",
    category: "unit",
    tier: "platinum",
    title: "Slide legend",
    description: "Complete every slide in the current classroom run.",
    icon: "star",
    reward: { xp: 75, gems: 110 },
    target: 100,
    metric: "slidePercent",
  },
  {
    id: "unit-complete-flag",
    category: "unit",
    tier: "platinum",
    title: "Unit conqueror",
    description: "Finish all 5 missions and clear the unit.",
    icon: "trophy",
    reward: { xp: 120, gems: 180 },
    target: 1,
    metric: "unitCompleteFlag",
  },

  // â€”â€” Hard section â€”â€”
  {
    id: "section-75",
    category: "section",
    tier: "platinum",
    title: "Mountain climber",
    description: "Reach 75% across Section 1 (all 10 units).",
    icon: "crown",
    reward: { xp: 150, gems: 220 },
    target: 75,
    metric: "sectionPercent",
  },
  {
    id: "section-100",
    category: "section",
    tier: "platinum",
    title: "Section legend",
    description: "Complete 100% of Section 1 â€” the ultimate grind.",
    icon: "gem",
    reward: { xp: 300, gems: 500 },
    target: 100,
    metric: "sectionPercent",
  },

  // â€”â€” Hard quiz â€”â€”
  {
    id: "quiz-pass-90",
    category: "quiz",
    tier: "platinum",
    title: "Brain royalty",
    description: "Score 90% or higher on any quiz.",
    icon: "crown",
    reward: { xp: 70, gems: 100 },
    target: 90,
    metric: "bestQuizPercent",
  },
  {
    id: "quiz-ten",
    category: "quiz",
    tier: "gold",
    title: "Quiz marathon",
    description: "Submit 10 classroom quizzes total.",
    icon: "zap",
    reward: { xp: 80, gems: 120 },
    target: 10,
    metric: "quizAttempts",
  },
  {
    id: "quiz-high-five",
    category: "quiz",
    tier: "platinum",
    title: "Honor roll",
    description: "Earn 80%+ on five separate quiz attempts.",
    icon: "medal",
    reward: { xp: 110, gems: 160 },
    target: 5,
    metric: "highScoreQuizzes",
  },
  {
    id: "quiz-perfect-trio",
    category: "quiz",
    tier: "platinum",
    title: "Perfect trilogy",
    description: "Score 100% on three different quizzes.",
    icon: "gem",
    reward: { xp: 200, gems: 280 },
    target: 3,
    metric: "perfectQuizCount",
  },

  // â€”â€” Hard streak â€”â€”
  {
    id: "streak-14",
    category: "streak",
    tier: "platinum",
    title: "Fortnight flame",
    description: "Keep a 14-day learning streak alive.",
    icon: "flame",
    reward: { xp: 100, gems: 150 },
    target: 14,
    metric: "streakDays",
  },
  {
    id: "streak-30",
    category: "streak",
    tier: "platinum",
    title: "Streak immortal",
    description: "Maintain a 30-day streak â€” only champions do this.",
    icon: "crown",
    reward: { xp: 250, gems: 400 },
    target: 30,
    metric: "streakDays",
  },

  // â€”â€” Hard legend / explorer â€”â€”
  {
    id: "legend-scene-15",
    category: "legend",
    tier: "gold",
    title: "Deep diver",
    description: "Reach slide 15 or deeper in the classroom.",
    icon: "book",
    reward: { xp: 45, gems: 70 },
    target: 15,
    metric: "sceneDepth",
  },
  {
    id: "legend-scene-25",
    category: "legend",
    tier: "platinum",
    title: "Bottom of the ocean",
    description: "Reach slide 25+ in one classroom adventure.",
    icon: "star",
    reward: { xp: 90, gems: 130 },
    target: 25,
    metric: "sceneDepth",
  },
  {
    id: "legend-launches-10",
    category: "legend",
    tier: "platinum",
    title: "Classroom captain",
    description: "Launch the AI School classroom 10 times from Explore.",
    icon: "target",
    reward: { xp: 60, gems: 95 },
    target: 10,
    metric: "classroomLaunches",
  },
  {
    id: "legend-claims-5",
    category: "legend",
    tier: "silver",
    title: "Badge collector",
    description: "Claim 5 achievement rewards.",
    icon: "medal",
    reward: { xp: 30, gems: 50 },
    target: 5,
    metric: "claimedAchievements",
  },
  {
    id: "legend-claims-15",
    category: "legend",
    tier: "platinum",
    title: "Trophy hoarder",
    description: "Claim 15 achievement rewards on Trophy Island.",
    icon: "trophy",
    reward: { xp: 150, gems: 250 },
    target: 15,
    metric: "claimedAchievements",
  },
  {
    id: "legend-wallet-500",
    category: "legend",
    tier: "gold",
    title: "Treasure chest",
    description: "Hold 500+ XP in your local adventure wallet.",
    icon: "gem",
    reward: { xp: 50, gems: 80 },
    target: 150,
    metric: "walletXp",
  },
  {
    id: "legend-playback-done",
    category: "legend",
    tier: "gold",
    title: "Story finisher",
    description: "Mark a full classroom playback as completed.",
    icon: "star",
    reward: { xp: 55, gems: 85 },
    target: 1,
    metric: "playbackCompletedFlag",
  },
  {
    id: "legend-languages-3",
    category: "legend",
    tier: "platinum",
    title: "Polyglot pioneer",
    description: "Start learning 3 different languages.",
    icon: "crown",
    reward: { xp: 80, gems: 120 },
    target: 3,
    metric: "languagesStarted",
  },
];
