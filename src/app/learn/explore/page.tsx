"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import ReactCountryFlag from "react-country-flag";
import section1Units from "../section1-units.json";
import {
  ChevronLeft,
  Menu,
  Home,
  Shield,
  ShoppingBag,
  User,
  MoreHorizontal,
} from "lucide-react";
import streakIcon from "@/assets/images/learn/streak.svg";
import pointsIcon from "@/assets/images/learn/points.svg";
import lifeIcon from "@/assets/images/learn/life.svg";
import learnIcon from "@/assets/images/learn/learn.svg";
import leaderboardsIcon from "@/assets/images/learn/leaderboards.svg";
import questIcon from "@/assets/images/learn/quest.svg";
import shopIcon from "@/assets/images/learn/shop.svg";
import profileIcon from "@/assets/images/learn/profile.svg";
import moreIcon from "@/assets/images/learn/more.svg";
import exploreGameBg from "@/assets/images/learn/explore-game-background.png";
import signupBg from "@/assets/images/learn/background-signup.png";
import loginBg from "@/assets/images/learn/login-background.png";
import missionCardActiveBg from "@/assets/images/learn/mission-card-active-bg.png";
import missionCardLockedBg from "@/assets/images/learn/mission-card-locked-bg.png";
import {
  createBrowserSupabaseClient,
  createLearnSupabaseClient,
  safeGetAuthUser,
  safeGetSessionAuthUser,
} from "@/lib/supabase/client";
import { LearnAmbientBackground } from "@/components/learn/learn-ambient-background";
import { LearnClickSoundLayer } from "@/components/learn/learn-click-sound-layer";
import { LearnSidebar } from "@/components/learn-sidebar";
import { ExploreDuolingoPath } from "@/components/learn/explore-duolingo-path";
import { ExploreLearningPath } from "@/components/learn/explore-learning-path";
import { ExploreUnitMissionCard } from "@/components/learn/explore-unit-mission-card";
import { ExploreUnitsMeadowBackdrop } from "@/components/learn/explore-units-meadow-backdrop";
import { getSectionPlaygroundTheme } from "@/components/learn/explore-section-playground-themes";
import unitViewStyles from "@/components/learn/explore-unit-view.module.css";
import { ExploreGuidebookModal } from "@/components/learn/explore-guidebook-modal";
import { ExploreStreakPanel } from "@/components/learn/explore-streak-panel";
import { ExploreLearnAside } from "@/components/learn/explore-learn-aside";
import { EXPLORE, pill3D } from "./explore-theme";
import layoutStyles from "./explore-layout.module.css";
import sidebarStyles from "@/components/learn-sidebar.module.css";
import {
  bumpLegacyStat,
  getLocalWallet,
} from "@/lib/learn/achievements-state";
import { touchDailyVisit } from "@/lib/learn/quests-state";
import {
  DEFAULT_LEARN_CLASSROOM_ID,
  LEARN_GUEST_SESSION_STORAGE_KEY,
  SLIDES_PER_CLASSROOM,
} from "@/lib/learn/constants";
import {
  computeSectionProgressPercent,
  getPlaybackSectionPercent,
  mapPlaybackRowToUnitProgress,
  mapSectionExploreProgress,
  type MappedUnitPlayback,
  type PlaybackProgressRow,
  type SectionExploreProgress,
} from "@/lib/learn/playback-progress";
import { logExploreProgressCheck } from "@/lib/learn/explore-progress-debug";
import {
  countCompletedStepsForUnit,
  getStepState,
  isStepMissionComplete,
  normalizePlaybackDetails,
  parseStepProgressMap,
} from "@/lib/learn/playback-step-progress";
import type { LearnQuizStats } from "@/lib/learn/quiz-stats";
import { ExploreQuizStats } from "@/components/learn/explore-quiz-stats";

const ACTIVE_LANGUAGE_STORAGE_KEY = "learn.activeLanguage";

/** Poll while Explore is visible so progress updates after classroom (other tab). */
const PLAYBACK_POLL_MS = 8_000;
/** Faster polls for 2 min after opening AI-School classroom in a new tab. */
const CLASSROOM_BURST_POLL_MS = 4_000;
const CLASSROOM_BURST_MS = 120_000;

function getOrCreateGuestSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(LEARN_GUEST_SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(LEARN_GUEST_SESSION_STORAGE_KEY, id);
  }
  return id;
}

/** Signed-in learners use auth cookie; guests use local guest session id. */
async function buildPlaybackProgressParams(
  sectionUnits: number,
  sectionId: number,
): Promise<URLSearchParams | null> {
  const params = new URLSearchParams({
    classroomId: DEFAULT_LEARN_CLASSROOM_ID,
    unitsInSection: String(sectionUnits),
    sectionId: String(sectionId),
  });

  const user = await safeGetSessionAuthUser();
  if (!user) {
    const guestSessionId = getOrCreateGuestSessionId();
    if (!guestSessionId) return null;
    params.set("guestSessionId", guestSessionId);
  }

  return params;
}

function normalizeQuizStatsByUnit(
  raw: Record<number, LearnQuizStats> | Record<string, LearnQuizStats> | undefined,
): Record<number, LearnQuizStats> {
  const out: Record<number, LearnQuizStats> = {};
  if (!raw) return out;
  for (const [key, value] of Object.entries(raw)) {
    const unitIndex = Number(key);
    if (Number.isFinite(unitIndex) && value) {
      out[unitIndex] = value;
    }
  }
  return out;
}

const LANGUAGES = [
  { code: "es", label: "Spanish", countryCode: "ES" },
  { code: "fr", label: "French", countryCode: "FR" },
  { code: "ja", label: "Japanese", countryCode: "JP" },
  { code: "de", label: "German", countryCode: "DE" },
  { code: "ko", label: "Korean", countryCode: "KR" },
  { code: "it", label: "Italian", countryCode: "IT" },
  { code: "pt", label: "Portuguese", countryCode: "BR" },
  { code: "ru", label: "Russian", countryCode: "RU" },
  { code: "tr", label: "Turkish", countryCode: "TR" },
  { code: "nl", label: "Dutch", countryCode: "NL" },
  { code: "sv", label: "Swedish", countryCode: "SE" },
  { code: "pl", label: "Polish", countryCode: "PL" },
  { code: "zh", label: "Chinese", countryCode: "CN" },
  { code: "ar", label: "Arabic", countryCode: "SA" },
  { code: "hi", label: "Hindi", countryCode: "IN" },
  { code: "ur", label: "Urdu", countryCode: "PK" },
  { code: "en", label: "English", countryCode: "GB" },
];

const SECTIONS = [
  {
    id: 1,
    title: "Section 1",
    bubble: "¡Hola!",
    description: "Learn your very first Spanish greetings.",
    icon: learnIcon,
    progress: 0,
    isCurrent: true,
  },
  {
    id: 2,
    title: "Section 2",
    bubble: "Quiero aprender español.",
    description: "Talk about your goals and why you learn.",
    icon: questIcon,
    progress: 0,
    isCurrent: false,
  },
  {
    id: 3,
    title: "Section 3",
    bubble: "¿Cómo estás?",
    description: "Ask how people are doing and respond.",
    icon: leaderboardsIcon,
    progress: 0,
    isCurrent: false,
  },
  {
    id: 4,
    title: "Section 4",
    bubble: "Me gustan los juegos.",
    description: "Talk about what you like and don't like.",
    icon: shopIcon,
    progress: 0,
    isCurrent: false,
  },
  {
    id: 5,
    title: "Section 5",
    bubble: "Voy a la escuela.",
    description: "Describe your daily routine and schedule.",
    icon: profileIcon,
    progress: 0,
    isCurrent: false,
  },
  {
    id: 6,
    title: "Section 6",
    bubble: "Hace buen tiempo hoy.",
    description: "Chat about the weather and seasons.",
    icon: streakIcon,
    progress: 0,
    isCurrent: false,
  },
  {
    id: 7,
    title: "Section 7",
    bubble: "Quiero comer algo.",
    description: "Order food and drinks with confidence.",
    icon: pointsIcon,
    progress: 0,
    isCurrent: false,
  },
  {
    id: 8,
    title: "Section 8",
    bubble: "Tengo muchos amigos.",
    description: "Introduce friends and talk about people.",
    icon: lifeIcon,
    progress: 0,
    isCurrent: false,
  },
];

type UnitStepKind = "start" | "lesson" | "chest" | "practice" | "review";
type UnitStepStatus = "locked" | "current" | "completed";

const UNIT_STEP_ORDER: UnitStepKind[] = [
  "start",
  "lesson",
  "chest",
  "practice",
  "review",
];

const UNIT_NAMES: string[] = [
  "Unit 1 · First greetings",
  "Unit 2 · Meet new friends",
  "Unit 3 · At school",
  "Unit 4 · Family & home",
  "Unit 5 · Food & café",
  "Unit 6 · Numbers & time",
  "Unit 7 · Feelings",
  "Unit 8 · Around town",
  "Unit 9 · Hobbies",
  "Unit 10 · Review & quiz",
];

const UNIT_COLORS: string[] = [
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#22c55e",
  "#6366f1",
  "#a855f7",
];

const MISSION_CARD_BACKGROUNDS = {
  active: missionCardActiveBg.src,
  locked: missionCardLockedBg.src,
};

interface UnitProgress {
  currentUnit: number; // 0..9 (10 units total)
  currentStep: number; // 0..4 (5 steps per unit)
}

interface ExploreSectionItem {
  id: number;
  dbSectionId: number;
  title: string;
  topicLabel: string;
  bubble: string;
  description: string;
  icon: any;
  progress: number;
  isCurrent: boolean;
}

interface ExploreUnitItem {
  id: number;
  title: string;
}

interface CardBackgroundArtProps {
  src: string;
  opacity?: number;
}

function CardBackgroundArt({ src, opacity = 0.26 }: CardBackgroundArtProps) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 0,
      }}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}


export default function LearnExplorePage() {
  const router = useRouter();
  const [profileInitial, setProfileInitial] = useState("A");
  const [profileDisplayName, setProfileDisplayName] = useState("Allen Girls");
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [sectionsData, setSectionsData] = useState<ExploreSectionItem[]>(
    SECTIONS.map((section) => ({
      ...section,
      dbSectionId: section.id,
      topicLabel: section.title,
    })),
  );
  const [unitMetaBySection, setUnitMetaBySection] = useState<
    Record<number, ExploreUnitItem[]>
  >({});
  const [activeSectionId, setActiveSectionId] = useState<number>(1);
  const [activeLanguage, setActiveLanguage] = useState<string>("es");
  const [availableLanguageCodes, setAvailableLanguageCodes] = useState<
    string[]
  >(LANGUAGES.map((lang) => lang.code));
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showStreakCard, setShowStreakCard] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [walletGems, setWalletGems] = useState(500);
  const [showUnitView, setShowUnitView] = useState(false);
  const [showGuidebook, setShowGuidebook] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [playbackMapped, setPlaybackMapped] =
    useState<MappedUnitPlayback | null>(null);
  /** Latest cloud `details` for per-mission resume vs fresh slide-1 launch. */
  const latestPlaybackDetailsRef = useRef<unknown>(null);
  const [quizStatsByUnit, setQuizStatsByUnit] = useState<
    Record<number, LearnQuizStats>
  >({});
  const [completedStepsByUnit, setCompletedStepsByUnit] = useState<
    Record<number, number>
  >({});
  const pathname = usePathname();
  const [unitProgressBySection, setUnitProgressBySection] = useState<
    Record<number, UnitProgress>
  >(() =>
    SECTIONS.reduce<Record<number, UnitProgress>>((acc, section) => {
      acc[section.id] = { currentUnit: 0, currentStep: 0 };
      return acc;
    }, {}),
  );
  const sectionIcons = [
    learnIcon,
    questIcon,
    leaderboardsIcon,
    shopIcon,
    profileIcon,
    streakIcon,
    pointsIcon,
    lifeIcon,
  ];
  const activeSection =
    sectionsData.find((s) => s.id === activeSectionId) ?? sectionsData[0];
  const activePlaygroundTheme = getSectionPlaygroundTheme(activeSection.id);

  const activeUnits = unitMetaBySection[activeSection?.id] ?? [];
  const activeUnitTitles =
    activeUnits.length > 0 ? activeUnits.map((unit) => unit.title) : UNIT_NAMES;
  const maxUnitIndex = Math.max(0, activeUnitTitles.length - 1);

  const currentUnitProgress = unitProgressBySection[activeSection?.id] ?? {
    currentUnit: 0,
    currentStep: 0,
  };

  const activePlayback =
    playbackMapped && playbackMapped.sectionId === activeSection?.id
      ? playbackMapped
      : null;

  const currentUnitQuizStats =
    quizStatsByUnit[currentUnitProgress.currentUnit] ?? null;

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;

      const user = await safeGetAuthUser(supabase);
      if (!user || !isMounted) return;

      let profile: { display_name?: string | null; role?: string | null } | null =
        null;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, role")
          .eq("id", user.id)
          .maybeSingle();
        profile = data;
      } catch {
        /* Supabase unreachable — use email fallback only */
      }

      const fallbackName = user.email?.split("@")[0] ?? "Learner";
      const resolvedName = profile?.display_name?.trim() || fallbackName;
      const initial = resolvedName.charAt(0).toUpperCase() || "L";

      if (!isMounted) return;
      setProfileDisplayName(resolvedName);
      setProfileInitial(initial);
      setProfileRole(profile?.role ?? null);

      if (process.env.NODE_ENV !== "production") {
        console.info("[Explore progress check] Signed-in profile", {
          authUserId: user.id,
          authEmail: user.email ?? null,
          profileRole: profile?.role ?? null,
          profileDisplayName: resolvedName,
        });
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const applyExploreProgress = (
      explore: SectionExploreProgress,
      progressRow: PlaybackProgressRow | null,
      options?: {
        mapped?: MappedUnitPlayback | null;
        sectionPercent?: number;
      },
    ) => {
      if (!isMounted) return;

      const sectionUnits =
        unitMetaBySection[explore.sectionId]?.length ?? UNIT_NAMES.length;
      const currentUnit = Math.min(
        Math.max(0, explore.currentUnit),
        Math.max(0, sectionUnits - 1),
      );
      const currentStep = Math.min(explore.currentStep, 5);

      setUnitProgressBySection((prev) => ({
        ...prev,
        [explore.sectionId]: { currentUnit, currentStep },
      }));

      const stepProgress = parseStepProgressMap(progressRow?.details);
      const stepsByUnit: Record<number, number> = {};
      for (let unitIndex = 0; unitIndex < sectionUnits; unitIndex++) {
        stepsByUnit[unitIndex] = countCompletedStepsForUnit(
          stepProgress,
          explore.sectionId,
          unitIndex,
        );
      }
      setCompletedStepsByUnit(stepsByUnit);

      const unitMapped = progressRow
        ? mapPlaybackRowToUnitProgress(progressRow, {
            unitsInSection: sectionUnits,
            unitIndex: currentUnit,
          })
        : (options?.mapped?.sectionId === explore.sectionId &&
          options.mapped.unitIndex === currentUnit
            ? options.mapped
            : null);

      if (unitMapped && unitMapped.sectionId === explore.sectionId) {
        setPlaybackMapped(unitMapped);
      } else {
        setPlaybackMapped(null);
      }

      const sectionProgress =
        typeof options?.sectionPercent === "number"
          ? options.sectionPercent
          : getPlaybackSectionPercent(progressRow, { unitsInSection: sectionUnits });

      setSectionsData((prev) =>
        prev.map((section) =>
          section.id === explore.sectionId
            ? { ...section, progress: sectionProgress }
            : section,
        ),
      );
    };

    const fetchPlaybackProgress = async () => {
      const sectionUnits =
        unitMetaBySection[activeSectionId]?.length ?? UNIT_NAMES.length;
      const params = await buildPlaybackProgressParams(
        sectionUnits,
        activeSectionId,
      );
      if (!params) return null;

      const res = await fetch(`/api/learn/playback-progress?${params}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return null;
      return (await res.json()) as {
        studentsOnly?: boolean;
        progress?: PlaybackProgressRow | null;
        mapped?: MappedUnitPlayback | null;
        exploreProgress?: SectionExploreProgress | null;
        sectionPercent?: number;
        quizStatsByUnit?: Record<number, LearnQuizStats>;
        debug?: {
          authUserId?: string | null;
          authEmail?: string | null;
          profileRole?: string | null;
          ownerMode?: string;
          ownerId?: string | null;
          rowLearnerId?: string | null;
          rowGuestSessionId?: string | null;
        };
      };
    };

    const runBindGuestProgress = async () => {
      const user = await safeGetSessionAuthUser();
      if (!user) return false;
      try {
        const guestSessionId = window.localStorage.getItem(
          LEARN_GUEST_SESSION_STORAGE_KEY,
        );
        const res = await fetch("/api/learn/bind-guest-progress", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify(guestSessionId ? { guestSessionId } : {}),
        });
        return res.ok;
      } catch {
        return false;
      }
    };

    const loadPlaybackProgress = async (opts?: { skipBind?: boolean }) => {
      try {
        const user = await safeGetSessionAuthUser();

        if (user && !opts?.skipBind) {
          await runBindGuestProgress();
        }

        const json = await fetchPlaybackProgress();
        if (!json || !isMounted) return;

        if (json.studentsOnly) {
          setPlaybackMapped(null);
          setCompletedStepsByUnit({});
          logExploreProgressCheck({
            signedIn: Boolean(user),
            authUserId: user?.id ?? json.debug?.authUserId ?? null,
            authEmail: user?.email ?? json.debug?.authEmail ?? null,
            profileRole: null,
            profileDisplayName: null,
            ownerMode: "none",
            ownerId: null,
            localGuestSessionId: window.localStorage.getItem(
              LEARN_GUEST_SESSION_STORAGE_KEY,
            ),
            apiStudentsOnly: true,
            rowLearnerId: null,
            rowGuestSessionId: null,
            sectionPercent: 0,
            currentUnit: 0,
            currentStep: 0,
            completedStepsByUnit: {},
            stepProgressKeyCount: 0,
          });
          return;
        }

        const sectionUnits =
          unitMetaBySection[activeSectionId]?.length ?? UNIT_NAMES.length;
        const progressRow = json.progress ?? null;
        latestPlaybackDetailsRef.current = progressRow?.details ?? null;

        let explore = json.exploreProgress ?? null;
        if (!explore && progressRow) {
          explore = mapSectionExploreProgress(progressRow, {
            unitsInSection: sectionUnits,
          });
        }
        if (!explore && json.mapped) {
          explore = {
            sectionId: json.mapped.sectionId,
            currentUnit: json.mapped.unitIndex,
            currentStep: json.mapped.currentStep,
          };
        }

        const stepProgress = parseStepProgressMap(progressRow?.details);
        const stepsByUnit: Record<number, number> = {};
        for (let u = 0; u < sectionUnits; u++) {
          stepsByUnit[u] = countCompletedStepsForUnit(
            stepProgress,
            explore?.sectionId ?? activeSectionId,
            u,
          );
        }

        if (explore) {
          applyExploreProgress(explore, progressRow, {
            mapped: json.mapped ?? null,
            sectionPercent: json.sectionPercent,
          });
        } else {
          setPlaybackMapped(null);
          setCompletedStepsByUnit({});
        }

        const supabase = createBrowserSupabaseClient();
        let profileRole: string | null = null;
        let profileDisplayName: string | null = null;
        if (user && supabase) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, role")
            .eq("id", user.id)
            .maybeSingle();
          profileRole = (profile?.role as string | null) ?? null;
          profileDisplayName =
            profile?.display_name?.trim() || user.email?.split("@")[0] || null;
        }

        logExploreProgressCheck({
          signedIn: Boolean(user),
          authUserId: user?.id ?? json.debug?.authUserId ?? null,
          authEmail: user?.email ?? json.debug?.authEmail ?? null,
          profileRole: profileRole ?? json.debug?.profileRole ?? null,
          profileDisplayName,
          ownerMode:
            json.debug?.ownerMode === "learner_id"
              ? "learner_id"
              : json.debug?.ownerMode === "guest_session_id"
                ? "guest_session_id"
                : user
                  ? "learner_id"
                  : window.localStorage.getItem(LEARN_GUEST_SESSION_STORAGE_KEY)
                    ? "guest_session_id"
                    : "none",
          ownerId:
            json.debug?.ownerId ??
            (user?.id ??
              window.localStorage.getItem(LEARN_GUEST_SESSION_STORAGE_KEY)),
          localGuestSessionId: window.localStorage.getItem(
            LEARN_GUEST_SESSION_STORAGE_KEY,
          ),
          apiStudentsOnly: false,
          rowLearnerId:
            (progressRow?.learner_id as string | null) ??
            json.debug?.rowLearnerId ??
            null,
          rowGuestSessionId:
            (progressRow?.guest_session_id as string | null) ??
            json.debug?.rowGuestSessionId ??
            null,
          sectionPercent:
            typeof json.sectionPercent === "number"
              ? json.sectionPercent
              : getPlaybackSectionPercent(progressRow, { unitsInSection: sectionUnits }),
          currentUnit: explore?.currentUnit ?? 0,
          currentStep: explore?.currentStep ?? 0,
          completedStepsByUnit: stepsByUnit,
          stepProgressKeyCount: Object.keys(stepProgress).length,
        });

        setQuizStatsByUnit(normalizeQuizStatsByUnit(json.quizStatsByUnit));
      } catch {
        /* offline or Supabase unavailable */
      }
    };

    void loadPlaybackProgress();

    const reload = () => {
      void loadPlaybackProgress();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") reload();
    };

    const pollId = window.setInterval(() => {
      if (document.visibilityState === "visible") reload();
    }, PLAYBACK_POLL_MS);

    const onClassroomOpened = () => {
      reload();
      const burstId = window.setInterval(() => {
        if (document.visibilityState === "visible") reload();
      }, CLASSROOM_BURST_POLL_MS);
      window.setTimeout(() => window.clearInterval(burstId), CLASSROOM_BURST_MS);
    };

    window.addEventListener("focus", reload);
    window.addEventListener("pageshow", reload);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("learn:quiz-updated", reload);
    window.addEventListener("learn:playback-updated", reload);
    window.addEventListener("learn:classroom-opened", onClassroomOpened);

    return () => {
      isMounted = false;
      window.clearInterval(pollId);
      window.removeEventListener("focus", reload);
      window.removeEventListener("pageshow", reload);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("learn:quiz-updated", reload);
      window.removeEventListener("learn:playback-updated", reload);
      window.removeEventListener("learn:classroom-opened", onClassroomOpened);
    };
  }, [activeSectionId, unitMetaBySection]);

  useEffect(() => {
    if (!showUnitView) return;

    const sectionUnits =
      unitMetaBySection[activeSectionId]?.length ?? UNIT_NAMES.length;

    void buildPlaybackProgressParams(sectionUnits, activeSectionId).then((params) => {
      if (!params) return;
      return fetch(`/api/learn/playback-progress?${params}`, {
        credentials: "include",
        cache: "no-store",
      });
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (json: { quizStatsByUnit?: Record<number, LearnQuizStats> } | null) => {
          if (json?.quizStatsByUnit) {
            setQuizStatsByUnit(normalizeQuizStatsByUnit(json.quizStatsByUnit));
          }
        },
      )
      .catch(() => {});
  }, [showUnitView, activeSectionId, unitMetaBySection]);

  useEffect(() => {
    let isMounted = true;
    touchDailyVisit();
    const syncWallet = () => setWalletGems(getLocalWallet().gems);
    syncWallet();

    fetch("/api/mission/streak")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { streak?: number } | null) => {
        if (isMounted && data) setStreakDays(data.streak ?? 0);
      })
      .catch(() => {});

    window.addEventListener("learn:quests-updated", syncWallet);
    window.addEventListener("learn:achievements-updated", syncWallet);
    window.addEventListener("storage", syncWallet);

    return () => {
      isMounted = false;
      window.removeEventListener("learn:quests-updated", syncWallet);
      window.removeEventListener("learn:achievements-updated", syncWallet);
      window.removeEventListener("storage", syncWallet);
    };
  }, []);

  useEffect(() => {
    const loadAvailableLanguages = async () => {
      const supabase = createLearnSupabaseClient();
      if (!supabase) return;

      try {
      const { data: courseRows, error: courseError } = await supabase
        .from("language_courses")
        .select("learning_languages!inner(code)")
        .eq("is_published", true)
        .eq("learning_languages.is_active", true);
      if (courseError || !courseRows?.length) return;

      const candidateCodes = courseRows
        .map((row: any) => {
          const lang = Array.isArray(row.learning_languages)
            ? row.learning_languages[0]
            : row.learning_languages;
          return lang?.code ?? null;
        })
        .filter(Boolean) as string[];

      const supportChecks = await Promise.all(
        candidateCodes.map(async (code) => {
          const { data: hasRows } = await supabase
            .from("learning_questions")
            .select("id")
            .eq("to_language", code)
            .limit(1);
          return [code, Boolean(hasRows?.length)] as const;
        }),
      );
      const distinctCodes = supportChecks
        .filter(([, ok]) => ok)
        .map(([code]) => code);
      if (!distinctCodes.length) return;
      setAvailableLanguageCodes(Array.from(new Set(distinctCodes)));
      } catch {
        /* keep default LANGUAGES list */
      }
    };

    void loadAvailableLanguages();
  }, []);

  useEffect(() => {
    const storedCode = window.localStorage.getItem(ACTIVE_LANGUAGE_STORAGE_KEY);
    if (!storedCode) return;
    if (!availableLanguageCodes.includes(storedCode)) return;
    setActiveLanguage(storedCode);
  }, [availableLanguageCodes]);

  useEffect(() => {
    if (
      !availableLanguageCodes.includes(activeLanguage) &&
      availableLanguageCodes.length > 0
    ) {
      const nextCode = availableLanguageCodes[0];
      setActiveLanguage(nextCode);
      window.localStorage.setItem(ACTIVE_LANGUAGE_STORAGE_KEY, nextCode);
    }
  }, [availableLanguageCodes, activeLanguage]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const sectionIds = sectionsData.map((section) => section.id);
    setUnitProgressBySection((prev) => {
      const next = { ...prev };
      sectionIds.forEach((id) => {
        if (!next[id]) {
          next[id] = { currentUnit: 0, currentStep: 0 };
        }
      });
      return next;
    });
    if (!sectionIds.includes(activeSectionId) && sectionIds.length) {
      setActiveSectionId(sectionIds[0]);
    }
  }, [sectionsData, activeSectionId]);

  useEffect(() => {
    const loadCurriculum = async () => {
      const supabase = createLearnSupabaseClient();
      if (!supabase) return;

      try {
      const { data: languageRow, error: languageError } = await supabase
        .from("learning_languages")
        .select("id")
        .eq("code", activeLanguage)
        .eq("is_active", true)
        .maybeSingle();
      if (languageError || !languageRow?.id) return;

      const { data: courseRow, error: courseError } = await supabase
        .from("language_courses")
        .select("id")
        .eq("language_id", languageRow.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (courseError || !courseRow?.id) return;

      const { data: sectionRows, error: sectionError } = await supabase
        .from("learning_sections")
        .select("id, slug, title, description, sort_order")
        .eq("language_course_id", courseRow.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (sectionError || !sectionRows?.length) return;

      const mappedSections: ExploreSectionItem[] = sectionRows.map(
        (row: any, index: number) => {
          const fallbackTitle = `Section ${index + 1}`;
          const titleFromDb = row.title?.trim() || fallbackTitle;
          const topicFromSlug = (row.slug || "")
            .replace(/^section-\d+-/, "")
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase())
            .trim();
          const isGenericTitle = /^Section\s+\d+$/i.test(titleFromDb);
          const topicLabel = topicFromSlug || titleFromDb;

          return {
            id: index + 1,
            dbSectionId: row.id,
            title: isGenericTitle
              ? `${titleFromDb} · ${topicLabel}`
              : titleFromDb,
            topicLabel,
            bubble: index === 0 ? "Let's go!" : "Keep learning!",
            description: row.description ?? "Continue your language journey.",
            icon: sectionIcons[index % sectionIcons.length],
            progress: 0,
            isCurrent: index === 0,
          };
        },
      );

      const dbSectionIds = mappedSections.map((section) => section.dbSectionId);
      const { data: unitRows, error: unitError } = await supabase
        .from("learning_units")
        .select("id, learning_section_id, title, sort_order")
        .in("learning_section_id", dbSectionIds)
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (unitError) return;

      const unitsByDbId = (unitRows ?? []).reduce<
        Record<number, ExploreUnitItem[]>
      >((acc, row: any) => {
        if (!acc[row.learning_section_id]) acc[row.learning_section_id] = [];
        acc[row.learning_section_id].push({ id: row.id, title: row.title });
        return acc;
      }, {});

      const unitsByUiId = mappedSections.reduce<
        Record<number, ExploreUnitItem[]>
      >((acc, section) => {
        acc[section.id] = unitsByDbId[section.dbSectionId] ?? [];
        return acc;
      }, {});

      setSectionsData(mappedSections);
      setUnitMetaBySection(unitsByUiId);
      setActiveSectionId(1);
      } catch {
        /* keep bundled section1-units.json fallback data */
      }
    };

    void loadCurriculum();
  }, [activeLanguage]);

  const currentUnitSteps = UNIT_STEP_ORDER.map<UnitStepStatus>(
    (_kind, index) => {
      if (index < currentUnitProgress.currentStep) return "completed";
      if (index === currentUnitProgress.currentStep) return "current";
      return "locked";
    },
  );

  const launchExternalLesson = async (
    unitIndex: number,
    step: UnitStepKind,
    dbUnitId?: number,
  ) => {
    if (isRedirecting) return;
    setIsRedirecting(true);

    try {
      await fetch("/api/learn/course-view", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          language: activeLanguage,
          sectionId: activeSection.id,
          dbSectionId: activeSection.dbSectionId,
          unitIndex,
          dbUnitId,
          step,
        }),
      });

      const sessionUser = await safeGetSessionAuthUser();
      const guestSessionId = sessionUser ? undefined : getOrCreateGuestSessionId();
      const stepIndex = UNIT_STEP_ORDER.indexOf(step);
      const stepProgress = parseStepProgressMap(latestPlaybackDetailsRef.current);
      const stepState = getStepState(
        stepProgress,
        activeSection.id,
        unitIndex,
        stepIndex,
      );
      const detailsMeta = normalizePlaybackDetails(latestPlaybackDetailsRef.current);
      const totalSlides =
        typeof detailsMeta?.totalSlides === "number" && detailsMeta.totalSlides > 0
          ? Number(detailsMeta.totalSlides)
          : activePlayback?.totalSlides ?? SLIDES_PER_CLASSROOM;

      // Resume only when reopening the same in-progress mission (not a new classroom).
      const resumeFromPlayback = Boolean(stepState && !isStepMissionComplete(stepState));

      const redirectRes = await fetch("/api/learn/redirect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          language: activeLanguage,
          sectionId: activeSection.id,
          dbSectionId: activeSection.dbSectionId,
          unitIndex,
          dbUnitId,
          step,
          ...(guestSessionId ? { guestSessionId } : {}),
          totalSlides,
          ...(resumeFromPlayback
            ? {
                resumeSceneIndex: stepState!.sceneIndex,
                resumeSceneId: stepState!.currentSceneId ?? undefined,
                resumePlaybackCompleted: stepState!.playbackCompleted,
              }
            : {
                resumeSceneIndex: 0,
                resumePlaybackCompleted: false,
              }),
        }),
      });

      if (!redirectRes.ok) {
        let apiError = "redirect_request_failed";
        try {
          const errJson = (await redirectRes.json()) as { error?: string };
          if (errJson.error) apiError = errJson.error;
        } catch {
          // ignore parse issues and keep generic error
        }
        throw new Error(apiError);
      }

      const redirectJson = (await redirectRes.json()) as {
        redirectUrl?: string;
        guestSessionId?: string | null;
      };
      if (!redirectJson.redirectUrl) {
        throw new Error("redirect_url_missing");
      }

      if (sessionUser) {
        window.localStorage.removeItem(LEARN_GUEST_SESSION_STORAGE_KEY);
      } else {
        const resolvedGuestId =
          redirectJson.guestSessionId ?? guestSessionId;
        if (resolvedGuestId) {
          window.localStorage.setItem(
            LEARN_GUEST_SESSION_STORAGE_KEY,
            resolvedGuestId,
          );
        }
      }

      bumpLegacyStat("classroomLaunches", 1);
      bumpLegacyStat("dailyXp", 5);
      window.dispatchEvent(new CustomEvent("learn:quests-updated"));
      window.open(redirectJson.redirectUrl, "_blank", "noopener,noreferrer");
      window.dispatchEvent(new CustomEvent("learn:classroom-opened"));
      setIsRedirecting(false);
    } catch (error) {
      console.error("[learn/explore] launchExternalLesson failed", error);
      setIsRedirecting(false);
    }
  };

  return (
    <>
      <div className={layoutStyles.page}>
        <LearnAmbientBackground />
        <LearnClickSoundLayer className={layoutStyles.shell}>
          {mobileNavOpen ? (
            <button
              type="button"
              className={layoutStyles.sidebarBackdrop}
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            />
          ) : null}

          {/* CENTER: MAIN SECTION CARD + LIST OR UNIT VIEW */}
          <main className={layoutStyles.main}>
            {/* Top bar: Menu (mobile) + Back + compact stats row */}
            <div
              className={layoutStyles.topBar}
              onMouseLeave={() => setShowStreakCard(false)}
            >
              <div className={layoutStyles.topBarStart}>
                <button
                  type="button"
                  className={`${layoutStyles.chipBtn} ${layoutStyles.menuToggle}`}
                  aria-label="Open navigation menu"
                  aria-expanded={mobileNavOpen}
                  onClick={() => setMobileNavOpen(true)}
                >
                  <Menu size={22} strokeWidth={2.5} aria-hidden />
                </button>
                <button
                  type="button"
                  className={`${layoutStyles.chipBtn} ${layoutStyles.backBtn} font-nunito`}
                  onClick={() => setShowUnitView(false)}
                >
                  <span className={layoutStyles.backBtnIcon} aria-hidden>
                    <ChevronLeft size={18} strokeWidth={2.5} />
                  </span>
                  <span>Back</span>
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "0.8rem",
                }}
              >
                {/* Language flag + popup */}
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    className={`${layoutStyles.chipBtn} ${layoutStyles.langBtn}`}
                    onClick={() => setShowLanguageMenu((v) => !v)}
                    aria-expanded={showLanguageMenu}
                    aria-label="My courses language"
                  >
                    <ReactCountryFlag
                      countryCode={
                        LANGUAGES.find((l) => l.code === activeLanguage)
                          ?.countryCode ?? "ES"
                      }
                      svg
                      style={{
                        width: "1.6rem",
                        height: "1.1rem",
                        borderRadius: 4,
                        display: "block",
                        boxShadow: "0 0 0 1px rgba(15,23,42,0.08)",
                      }}
                    />
                  </button>

                  {showLanguageMenu && (
                    <div
                      style={{
                        position: "absolute",
                        top: "140%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        minWidth: 190,
                        borderRadius: "1rem",
                        background: "#ffffff",
                        border: "1px solid rgba(209,213,219,0.95)",
                        boxShadow: "0 20px 45px rgba(148,163,184,0.5)",
                        padding: "0.5rem 0.5rem 0.45rem",
                        zIndex: 20,
                      }}
                    >
                      <p
                        className="font-nunito"
                        style={{
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.16em",
                          color: "#9ca3af",
                          marginBottom: "0.35rem",
                        }}
                      >
                        My courses
                      </p>
                      {LANGUAGES.filter((lang) =>
                        availableLanguageCodes.includes(lang.code),
                      ).map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setActiveLanguage(lang.code);
                            window.localStorage.setItem(
                              ACTIVE_LANGUAGE_STORAGE_KEY,
                              lang.code,
                            );
                            setShowLanguageMenu(false);
                          }}
                          style={{
                            width: "100%",
                            borderRadius: "0.8rem",
                            border: "none",
                            background:
                              lang.code === activeLanguage
                                ? "#eff6ff"
                                : "transparent",
                            padding: "0.35rem 0.45rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.45rem",
                            cursor: "pointer",
                          }}
                        >
                          <ReactCountryFlag
                            countryCode={lang.countryCode}
                            svg
                            style={{
                              width: "1.3rem",
                              height: "0.9rem",
                              borderRadius: 4,
                              boxShadow: "0 0 0 1px rgba(15,23,42,0.08)",
                            }}
                          />
                          <span
                            className="font-nunito"
                            style={{
                              fontSize: "0.8rem",
                              color:
                                lang.code === activeLanguage
                                  ? "#1d4ed8"
                                  : "#111827",
                            }}
                          >
                            {lang.label}
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => router.push("/learn/courses")}
                        style={{
                          marginTop: "0.25rem",
                          width: "100%",
                          borderRadius: "0.8rem",
                          border: "1px dashed rgba(209,213,219,0.9)",
                          background: "#f9fafb",
                          padding: "0.3rem 0.45rem",
                          fontSize: "0.78rem",
                          color: "#6b7280",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                      >
                        + Add a new course
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onMouseEnter={() => setShowStreakCard(true)}
                  onClick={() => setShowStreakCard((v) => !v)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.35rem 0.85rem",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    ...pill3D(EXPLORE.streak, EXPLORE.streakDark),
                  }}
                >
                  <Image
                    src={streakIcon}
                    alt="Streak"
                    width={22}
                    height={22}
                    style={{ display: "block" }}
                  />
                  <span>{streakDays}</span>
                </button>
                <motion.div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.35rem 0.8rem",
                    color: "#fff",
                    ...pill3D(EXPLORE.sky, EXPLORE.skyDark),
                  }}
                >
                  <Image
                    src={pointsIcon}
                    alt="Points"
                    width={20}
                    height={20}
                    style={{ display: "block" }}
                  />
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "0.9rem",
                    }}
                  >
                    {walletGems}
                  </span>
                </motion.div>
                <motion.div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.35rem 0.8rem",
                    color: "#fff",
                    ...pill3D(EXPLORE.heart, EXPLORE.heartDark),
                  }}
                >
                  <Image
                    src={lifeIcon}
                    alt="Lives"
                    width={20}
                    height={20}
                    style={{ display: "block" }}
                  />
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "0.9rem",
                    }}
                  >
                    5
                  </span>
                </motion.div>
              </div>

              {showStreakCard && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.5rem)",
                    right: 0,
                    zIndex: 50,
                  }}
                  onMouseEnter={() => setShowStreakCard(true)}
                >
                  <ExploreStreakPanel
                    streakDays={streakDays}
                    onClose={() => setShowStreakCard(false)}
                    onViewMore={() => {
                      setShowStreakCard(false);
                      router.push("/learn/quests");
                    }}
                  />
                </div>
              )}
            </div>

            {/* Either show section list view or unit path view */}
            {!showUnitView && (
              <ExploreLearningPath
                learnerScopeLabel={
                  profileRole === "student" && profileDisplayName
                    ? `${profileDisplayName}'s progress`
                    : null
                }
                sections={sectionsData.map((section) => ({
                  id: section.id,
                  title: section.title,
                  bubble: section.bubble,
                  description: section.description,
                  icon: section.icon,
                  progress: section.progress,
                  unitsInSection:
                    unitMetaBySection[section.id]?.length ?? UNIT_NAMES.length,
                }))}
                activeSectionId={activeSectionId}
                onSectionContinue={(sectionId) => {
                  setActiveSectionId(sectionId);
                  setShowUnitView(true);
                }}
              />
            )}

            {showUnitView && (
              <section className={`font-nunito ${unitViewStyles.sectionShell}`}>
                <header className={unitViewStyles.unitHero}>
                  <div className={unitViewStyles.unitSignBoard}>
                    <div className={unitViewStyles.unitSignRow}>
                      <div className={unitViewStyles.unitSignText}>
                        <p className={unitViewStyles.sectionEyebrow}>
                          Section {activeSection.id} · Unit{" "}
                          {currentUnitProgress.currentUnit + 1}
                        </p>
                        <p className={unitViewStyles.sectionTitle}>
                          {activeSection.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={unitViewStyles.guidebookBtn}
                        onClick={() => setShowGuidebook(true)}
                      >
                        📖 Guidebook
                      </button>
                    </div>
                  </div>

                  {activePlayback ? (
                    <div
                      className={unitViewStyles.progressDock}
                      aria-label={`Lesson progress ${activePlayback.percent} percent`}
                    >
                      <div className={unitViewStyles.progressOrb}>
                        <span className={unitViewStyles.orbLabel}>Unit</span>
                        <strong>{activePlayback.unitPercent}%</strong>
                      </div>
                      <div className={unitViewStyles.progressOrb}>
                        <span className={unitViewStyles.orbLabel}>Section</span>
                        <strong>{activePlayback.sectionPercent}%</strong>
                      </div>
                      <div className={unitViewStyles.progressOrb}>
                        <span className={unitViewStyles.orbLabel}>Slides</span>
                        <strong>{activePlayback.slidePercent}%</strong>
                      </div>
                      <span className={unitViewStyles.missionChip}>
                        {activePlayback.statusLabel}
                      </span>
                    </div>
                  ) : null}
                </header>

                {currentUnitQuizStats &&
                (currentUnitQuizStats.attemptsCount > 0 ||
                  currentUnitQuizStats.lastQuiz ||
                  currentUnitQuizStats.recentAttempts.length > 0) ? (
                  <div
                    className={unitViewStyles.quizStrip}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <p className={`${unitViewStyles.quizStripLabel} font-nunito`}>
                      Unit {currentUnitProgress.currentUnit + 1} quizzes
                    </p>
                    <ExploreQuizStats stats={currentUnitQuizStats} />
                  </div>
                ) : null}

                <div
                  className={unitViewStyles.unitsPlayground}
                  style={{
                    borderColor: activePlaygroundTheme.borderColor,
                    boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.35), 0 6px 0 ${activePlaygroundTheme.borderColor}`,
                  }}
                  title={activePlaygroundTheme.label}
                >
                  <ExploreUnitsMeadowBackdrop sectionId={activeSection.id} />
                  <div
                    className={unitViewStyles.unitsPlaygroundPattern}
                    aria-hidden
                  />
                  <div className={unitViewStyles.unitsGrid}>
                    {activeUnitTitles.map((unitTitle, index) => {
                      const unitIndex = index;
                      const isCurrentUnit =
                        unitIndex === currentUnitProgress.currentUnit;
                      const themeColor =
                        UNIT_COLORS[unitIndex % UNIT_COLORS.length];

                      const cloudSteps = completedStepsByUnit[unitIndex] ?? 0;
                      const ladderStepsTotal = UNIT_STEP_ORDER.length;

                      let stepsForUnit: UnitStepStatus[];
                      let completedCountForUnit = 0;

                      if (
                        cloudSteps >= ladderStepsTotal ||
                        unitIndex < currentUnitProgress.currentUnit
                      ) {
                        stepsForUnit = UNIT_STEP_ORDER.map(() => "completed");
                        completedCountForUnit = ladderStepsTotal;
                      } else if (isCurrentUnit) {
                        stepsForUnit = currentUnitSteps;
                        completedCountForUnit = Math.max(
                          currentUnitProgress.currentStep,
                          cloudSteps,
                        );
                      } else if (cloudSteps > 0) {
                        stepsForUnit = UNIT_STEP_ORDER.map((_, stepIndex) => {
                          if (stepIndex < cloudSteps) return "completed";
                          if (stepIndex === cloudSteps) return "current";
                          return "locked";
                        });
                        completedCountForUnit = cloudSteps;
                      } else {
                        stepsForUnit = UNIT_STEP_ORDER.map(() => "locked");
                        completedCountForUnit = 0;
                      }

                      const isCompletedUnit =
                        unitIndex < currentUnitProgress.currentUnit ||
                        cloudSteps >= ladderStepsTotal;

                      const showPlaybackOnUnit =
                        isCurrentUnit &&
                        activePlayback &&
                        activePlayback.unitIndex === unitIndex;

                      const unitQuizStats = quizStatsByUnit[unitIndex] ?? null;

                      const statusLabel = showPlaybackOnUnit
                        ? activePlayback.statusLabel
                        : isCurrentUnit
                          ? "Current unit"
                          : isCompletedUnit
                            ? "Completed"
                            : "Locked";

                      const rewardLabel = showPlaybackOnUnit
                        ? `Slide ${activePlayback.sceneIndex + 1}/${activePlayback.totalSlides} · mission ${activePlayback.ladderStepIndex + 1}/5`
                        : isCurrentUnit
                          ? "Reward: 10 XP"
                          : isCompletedUnit
                            ? "Reward: 10 XP + 1 chest"
                            : "Locked · finish earlier units";

                      return (
                        <ExploreUnitMissionCard
                          key={unitIndex}
                          sectionId={activeSection.id}
                          unitIndex={unitIndex}
                          unitTitle={unitTitle}
                          themeColor={themeColor}
                          isCurrent={isCurrentUnit}
                          isCompleted={isCompletedUnit}
                          rewardLabel={rewardLabel}
                          statusLabel={statusLabel}
                          quizStats={unitQuizStats}
                        >
                          <ExploreDuolingoPath
                            steps={stepsForUnit}
                            themeColor={themeColor}
                            currentCount={completedCountForUnit}
                            onStepClick={(stepIndex) => {
                              if (!isCurrentUnit) return;
                              const stepKind = UNIT_STEP_ORDER[stepIndex];
                              const dbUnitId = activeUnits[unitIndex]?.id;
                              void launchExternalLesson(
                                unitIndex,
                                stepKind,
                                dbUnitId,
                              );
                            }}
                          />
                        </ExploreUnitMissionCard>
                      );
                    })}
                  </div>
                </div>

                <div className={unitViewStyles.nextUpHero}>
                  <div className={unitViewStyles.nextUpDecor} aria-hidden />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "0.68rem",
                        color: "#64748b",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 700,
                      }}
                    >
                      Next up
                    </p>
                    <p
                      className="font-fredoka"
                      style={{
                        fontSize: "1.08rem",
                        fontWeight: 700,
                        color: "#111827",
                        marginBottom: "0.45rem",
                        lineHeight: 1.3,
                      }}
                    >
                      Start your first greetings lesson
                    </p>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 999,
                        background: "#e5e7eb",
                        overflow: "hidden",
                        marginBottom: "0.35rem",
                      }}
                    >
                      <div
                        style={{
                          width: "0%",
                          height: "100%",
                          borderRadius: 999,
                          background:
                            "linear-gradient(90deg,#22c55e,#4ade80,#bef264)",
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="font-fredoka"
                      style={{
                        border: "none",
                        borderRadius: "999px",
                        padding: "0.6rem 1.75rem",
                        background: EXPLORE.green,
                        color: "#fff",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        ...pill3D(EXPLORE.green, EXPLORE.greenDark),
                        transform: "translateY(0)",
                        transition:
                          "transform 120ms ease-out, box-shadow 120ms ease-out",
                      }}
                      onClick={() => {
                        const stepKind =
                          UNIT_STEP_ORDER[currentUnitProgress.currentStep];
                        const dbUnitId =
                          activeUnits[currentUnitProgress.currentUnit]?.id;

                        void launchExternalLesson(
                          currentUnitProgress.currentUnit,
                          stepKind,
                          dbUnitId,
                        );
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = "translateY(1px)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 12px rgba(37,99,235,0.2)";
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 10px 20px rgba(37,99,235,0.25), 0 0 0 1px rgba(59,130,246,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 10px 20px rgba(37,99,235,0.25), 0 0 0 1px rgba(59,130,246,0.3)";
                      }}
                    >
                      {isRedirecting
                        ? "Opening..."
                        : currentUnitProgress.currentStep === 0
                          ? "Start"
                          : currentUnitProgress.currentStep === 1
                            ? "Resume lesson"
                            : "Continue"}
                    </button>
                  </div>

                  <div
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 30% 10%, #dbeafe, #93c5fd 65%, #3b82f6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 14px 28px rgba(37,99,235,0.24)",
                    }}
                  >
                    <Image
                      src={activeSection.icon}
                      alt="Section icon"
                      width={44}
                      height={44}
                      style={{ display: "block" }}
                    />
                  </div>
                </div>

                {/* Extra path preview — desktop only; current unit path lives in the active card */}
                <div className={unitViewStyles.unitPathFooter}>
                  <ExploreDuolingoPath
                    steps={currentUnitSteps}
                    themeColor={
                      UNIT_COLORS[
                        currentUnitProgress.currentUnit % UNIT_COLORS.length
                      ]
                    }
                    onStepClick={(stepIndex) => {
                      const stepKind = UNIT_STEP_ORDER[stepIndex];
                      const dbUnitId =
                        activeUnits[currentUnitProgress.currentUnit]?.id;
                      void launchExternalLesson(
                        currentUnitProgress.currentUnit,
                        stepKind,
                        dbUnitId,
                      );
                    }}
                  />
                </div>
              </section>
            )}
          </main>

          <div
            className={`${layoutStyles.sidebarWrap} ${
              mobileNavOpen ? layoutStyles.sidebarWrapOpen : ""
            }`.trim()}
          >
            <LearnSidebar
              activeTab="learn"
              profileInitial={profileInitial}
              profileDisplayName={profileDisplayName}
              profileRole={profileRole}
              railClassName={sidebarStyles.railMobileDrawer}
            />
          </div>

          <div className={layoutStyles.aside}>
            <ExploreLearnAside />
          </div>
        </LearnClickSoundLayer>
      </div>

      <ExploreGuidebookModal
        open={showGuidebook}
        onClose={() => setShowGuidebook(false)}
      />
    </>
  );
}


interface LessonQuizProps {
  unitIndex: number;
  activeLanguage: string;
  onComplete: () => void;
}

function LessonQuiz({
  unitIndex,
  activeLanguage,
  onComplete,
}: LessonQuizProps) {
  const section: any = section1Units;
  const unit = section?.units?.[unitIndex];
  if (!unit) return null;

  const lessonStep = unit.steps.find((s: any) => s.kind === "lesson");
  const questions = lessonStep?.questions ?? [];
  if (!questions.length) return null;

  const preferred =
    questions.find((q: any) => q.toLanguage === activeLanguage) ?? questions[0];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (id: string, correct: boolean) => {
    setSelectedId(id);
    setShowExplanation(true);
    if (correct) {
      // small delay before advancing
      setTimeout(() => {
        onComplete();
      }, 600);
    }
  };

  return (
    <div
      style={{
        alignSelf: "stretch",
        marginTop: "1.1rem",
        borderRadius: "1.4rem",
        background: "#ffffff",
        border: "1px solid rgba(226,232,240,0.95)",
        boxShadow: "0 18px 40px rgba(148,163,184,0.35)",
        padding: "0.9rem 1rem 1rem",
      }}
    >
      <p
        className="font-fredoka"
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          marginBottom: "0.4rem",
          color: "#111827",
        }}
      >
        {lessonStep?.title ?? "Lesson quiz"}
      </p>
      <p
        style={{
          fontSize: "0.8rem",
          color: "#6b7280",
          marginBottom: "0.7rem",
        }}
      >
        {preferred.prompt}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "0.4rem",
          marginBottom: "0.5rem",
        }}
      >
        {preferred.answers.map((ans: any) => {
          const isSelected = selectedId === ans.id;
          const isCorrect = ans.correct;

          let bg = "#ffffff";
          let border = "1px solid rgba(209,213,219,0.95)";
          if (selectedId) {
            if (isCorrect) {
              bg = "#dcfce7";
              border = "1px solid rgba(34,197,94,0.9)";
            } else if (isSelected && !isCorrect) {
              bg = "#fee2e2";
              border = "1px solid rgba(248,113,113,0.9)";
            }
          } else if (isSelected) {
            bg = "#eff6ff";
          }

          return (
            <button
              key={ans.id}
              type="button"
              onClick={() => handleSelect(ans.id, ans.correct)}
              style={{
                textAlign: "left",
                borderRadius: "0.8rem",
                border,
                background: bg,
                padding: "0.5rem 0.7rem",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {ans.text}
            </button>
          );
        })}
      </div>

      {showExplanation && preferred.explanation && (
        <p
          style={{
            fontSize: "0.78rem",
            color: "#4b5563",
          }}
        >
          {preferred.explanation}
        </p>
      )}
    </div>
  );
}

