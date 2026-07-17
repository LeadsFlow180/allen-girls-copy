export type ParentDashboardSlide = {
  classroomId: string;
  currentSceneId: string | null;
  sceneIndex: number;
  actionIndex: number;
  status: string;
  /** Slide finished — resume checkpoint only. */
  playbackCompleted: boolean;
  /** Ladder mission finished for this step. */
  missionComplete: boolean;
  /** Classroom slide count from AI-School (`details.totalSlides`). */
  totalSlides: number;
  updatedAt: string;
  /** Parsed from cloud `details` (same ladder index as Explore) */
  sectionId: number | null;
  unitIndex: number | null;
  ladderStep: string | null;
  ladderStepIndex: number | null;
};

export type ParentDashboardQuiz = {
  submittedAt: string;
  classroomId: string;
  sceneId: string | null;
  ladderStep: string | null;
  sectionId: number | null;
  unitIndex: number | null;
  percent: number;
  score: number;
  totalPoints: number;
  correctCount: number;
  questionCount: number;
};

export type ParentDashboardQuestDay = {
  questDate: string;
  claimedDaily: string[];
  claimedWeekly: string[];
  claimedMonthly: string[];
};

export type ParentDashboardMission = {
  skillId: string;
  moduleId: string;
  worldSlug: string;
  subjectCategory: string;
  gateType: string;
  score: number;
  pointsAwarded: number;
  completedAt: string;
};

export type ParentDashboardModuleDone = {
  moduleId: string;
  worldSlug: string;
  skillsCount: number;
  totalPoints: number;
  completedAt: string;
};

export type ParentDashboardCheckpoint = {
  missionId: string;
  checkpointType: string;
  gateType: string | null;
  createdAt: string;
};

export type ParentDashboardChildExtended = {
  slides: ParentDashboardSlide[];
  quizzes: ParentDashboardQuiz[];
  questDays: ParentDashboardQuestDay[];
  missions: ParentDashboardMission[];
  modulesCompleted: ParentDashboardModuleDone[];
  streak: { current: number; longest: number; lastActiveDate: string | null } | null;
  checkpoints: ParentDashboardCheckpoint[];
  summary: {
    slideSessions: number;
    completedSlideSessions: number;
    /** Ladder missions fully complete (status complete / missionComplete). */
    missionsCompleted: number;
    /** Missions with cloud activity but not finished yet. */
    missionsInProgress: number;
    /** Latest activity: 1-based slide index within classroom. */
    latestSlideScene: number | null;
    latestSlideTotal: number | null;
    /** Latest activity: 1-based mission index within unit (1..5). */
    latestMissionIndex: number | null;
    quizCount: number;
    avgQuizPercent: number | null;
    questsClaimedTotal: number;
    skillsPassed: number;
    modulesCleared: number;
  };
};

export type ParentDashboardChild = {
  userId: string;
  studentNumber: number;
  displayName: string;
  approvedAt: string;
  placement: {
    tier: string;
    elaPercent: number;
    mathPercent: number;
    overallPercent: number;
    completedAt: string;
  } | null;
  domainTiers: { domain: string; tier: string; percent: number }[];
  learningPath: {
    focusDomain: string;
    recommendedWorldSlug: string;
    overallTier: string;
    nextSkillIds: string[];
  } | null;
  points: { balance: number; lifetimeEarned: number } | null;
  butterflies: { speciesKey: string; label: string; earnedAt: string }[];
  recentActivity: { eventType: string; amount: number; createdAt: string }[];
  progress: ParentDashboardChildExtended;
};
