"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Globe2, Sparkles, Users, Zap } from "lucide-react";
import { LearnPageFrame } from "@/components/learn-page-frame";
import { createLearnSupabaseClient } from "@/lib/supabase/client";
import exploreGameBg from "@/assets/images/learn/explore-game-background.png";
import {
  CourseFlagChip,
  CourseFlagMedallion,
} from "./course-flag-medallion";
import { getCourseAccent } from "./course-accents";
import styles from "./courses-page.module.css";

const SKY_STARS = [
  { top: "8%", left: "6%" },
  { top: "18%", left: "88%" },
  { top: "42%", left: "4%" },
  { top: "55%", left: "92%" },
];

const ACTIVE_LANGUAGE_STORAGE_KEY = "learn.activeLanguage";

type CourseItem = {
  code: string;
  label: string;
  learners: string;
  countryCode: string;
};

const COUNTRY_CODE_FALLBACK: Record<string, string> = {
  es: "ES",
  fr: "FR",
  de: "DE",
  it: "IT",
  pt: "BR",
  ar: "SA",
  ur: "PK",
  en: "GB",
};

const STATIC_COURSES: CourseItem[] = [
  { code: "es", label: "Spanish", learners: "48.8M", countryCode: "ES" },
  { code: "fr", label: "French", learners: "27.2M", countryCode: "FR" },
  { code: "ja", label: "Japanese", learners: "24.4M", countryCode: "JP" },
  { code: "de", label: "German", learners: "19M", countryCode: "DE" },
  { code: "ko", label: "Korean", learners: "17.8M", countryCode: "KR" },
  { code: "it", label: "Italian", learners: "13.4M", countryCode: "IT" },
  { code: "pt", label: "Portuguese", learners: "20.3M", countryCode: "BR" },
  { code: "ru", label: "Russian", learners: "16.1M", countryCode: "RU" },
  { code: "tr", label: "Turkish", learners: "10.4M", countryCode: "TR" },
  { code: "nl", label: "Dutch", learners: "9.2M", countryCode: "NL" },
  { code: "sv", label: "Swedish", learners: "8.3M", countryCode: "SE" },
  { code: "pl", label: "Polish", learners: "7.5M", countryCode: "PL" },
  { code: "zh", label: "Chinese", learners: "11.8M", countryCode: "CN" },
  { code: "ar", label: "Arabic", learners: "9.9M", countryCode: "SA" },
  { code: "hi", label: "Hindi", learners: "11.7M", countryCode: "IN" },
  { code: "ur", label: "Urdu", learners: "5.2M", countryCode: "PK" },
];

const COURSE_BLURBS: Record<string, string> = {
  fr: "Stroll with Chloé through Paris.",
  ja: "Cook with Hana in Tokyo.",
  de: "Build robots with Max in Berlin.",
  ko: "Sing with Jisoo in Seoul.",
  it: "Eat gelato with Luca in Rome.",
  pt: "Dance with Ana in Rio.",
  ru: "Explore stories with Ivan in Moscow.",
  tr: "Shop with Elif in Istanbul.",
  nl: "Ride bikes with Noor in Amsterdam.",
  sv: "Sail with Leo in Stockholm.",
  pl: "Solve puzzles with Ola in Warsaw.",
  zh: "Explore markets with Li in Beijing.",
  ar: "Share stories with Layla in Riyadh.",
  hi: "Celebrate with Riya in Delhi.",
  ur: "Play with Ayaan in Lahore.",
};

export default function LearnCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>(STATIC_COURSES);
  const [activeCode, setActiveCode] = useState("es");
  const [showAllCourses, setShowAllCourses] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      const supabase = createLearnSupabaseClient();
      if (!supabase) return;

      try {
      const { data, error } = await supabase
        .from("language_courses")
        .select(
          "title, learners_label, sort_order, learning_languages!inner(code, name, country_code)",
        )
        .eq("is_published", true)
        .eq("learning_languages.is_active", true)
        .order("sort_order", { ascending: true });

      if (error || !data?.length) return;

      const candidateCodes = data
        .map((row: { learning_languages: unknown }) => {
          const lang = Array.isArray(row.learning_languages)
            ? row.learning_languages[0]
            : row.learning_languages;
          return (lang as { code?: string })?.code ?? null;
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
      const supportedCodes = new Set(
        supportChecks.filter(([, ok]) => ok).map(([code]) => code),
      );

      const mapped = data
        .map(
          (row: {
            title?: string;
            learners_label?: string;
            learning_languages: unknown;
          }) => {
            const lang = Array.isArray(row.learning_languages)
              ? row.learning_languages[0]
              : row.learning_languages;
            const langRow = lang as {
              code?: string;
              name?: string;
              country_code?: string;
            };

            if (!langRow?.code) return null;
            if (!supportedCodes.has(langRow.code)) return null;
            const resolvedCountryCode =
              langRow.country_code ??
              COUNTRY_CODE_FALLBACK[langRow.code] ??
              langRow.code.toUpperCase();

            return {
              code: langRow.code,
              label: row.title ?? langRow.name ?? langRow.code.toUpperCase(),
              learners: row.learners_label ?? "0",
              countryCode: resolvedCountryCode,
            } satisfies CourseItem;
          },
        )
        .filter(Boolean) as CourseItem[];

      if (mapped.length) {
        setCourses(mapped);
      }
      } catch {
        /* keep STATIC_COURSES */
      }
    };

    void loadCourses();
  }, []);

  useEffect(() => {
    const storedCode = window.localStorage.getItem(ACTIVE_LANGUAGE_STORAGE_KEY);
    if (!storedCode) return;
    if (!courses.some((course) => course.code === storedCode)) return;
    setActiveCode(storedCode);
  }, [courses]);

  useEffect(() => {
    if (
      !courses.some((course) => course.code === activeCode) &&
      courses.length > 0
    ) {
      setActiveCode(courses[0].code);
    }
  }, [courses, activeCode]);

  const selectCourseAndContinue = (code: string) => {
    setActiveCode(code);
    window.localStorage.setItem(ACTIVE_LANGUAGE_STORAGE_KEY, code);
    router.push("/learn/explore");
  };

  const activeCourse = courses.find((c) => c.code === activeCode);
  const activeAccent = activeCourse
    ? getCourseAccent(activeCourse.code)
    : "#58cc02";
  const inactiveCourses = courses.filter((course) => course.code !== activeCode);
  const visibleCourses = showAllCourses
    ? inactiveCourses
    : inactiveCourses.slice(0, 8);

  return (
    <LearnPageFrame activeTab="courses" className={styles.frameRoot}>
      <div className={styles.pageInner}>
        <div className={styles.coursesWorld}>
          <div className={styles.skyDecor} aria-hidden>
            <Image
              src={exploreGameBg}
              alt=""
              fill
              className={styles.worldBg}
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
            />
            <div className={styles.worldOverlay} />
            <div className={styles.sun} />
            <div className={`${styles.cloud} ${styles.cloudA}`} />
            <div className={`${styles.cloud} ${styles.cloudB}`} />
            {SKY_STARS.map((spot, i) => (
              <span
                key={i}
                className={styles.star}
                style={{ ...spot, animationDelay: `${i * 0.35}s` }}
              />
            ))}
            <div className={styles.hillBack} />
            <div className={styles.hillFront} />
          </div>

          <main className={styles.main}>
          <header className={styles.header}>
            <div className={styles.headerStart}>
              <button
                type="button"
                className={`${styles.backBtn} font-nunito`}
                onClick={() => router.push("/learn/explore")}
              >
                <span className={styles.backIcon} aria-hidden>
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </span>
                <span className={styles.backLabel}>Back</span>
              </button>
              <div className={styles.titleBlock}>
                <div className={styles.titleRow}>
                  <span className={`${styles.pageBadge} font-nunito`}>
                    <Globe2 size={12} strokeWidth={2.5} aria-hidden />
                    Courses
                  </span>
                </div>
                <h1 className={`${styles.pageTitle} font-fredoka`}>
                  Courses for English speakers
                </h1>
                <p className={`${styles.pageSubtitle} font-nunito`}>
                  Pick a language to explore with the Allen Girls.
                </p>
              </div>
            </div>
            <button type="button" className={`${styles.speakBtn} font-nunito`}>
              <span>I SPEAK ENGLISH</span>
              <span aria-hidden>▾</span>
            </button>
          </header>

          {activeCourse ? (
            <section
              className={styles.hero}
              style={
                {
                  "--hero-accent": activeAccent,
                  borderColor: `${activeAccent}55`,
                  boxShadow: `0 5px 0 color-mix(in srgb, ${activeAccent} 45%, #c8e6b0), 0 22px 48px color-mix(in srgb, ${activeAccent} 16%, transparent)`,
                } as CSSProperties
              }
            >
              <div className={styles.heroAccentPanel} aria-hidden />
              <div className={styles.heroGlow} aria-hidden />
              <span className={styles.heroWatermark} aria-hidden>
                AG
              </span>
              <div className={styles.heroMedallionCol}>
                <CourseFlagMedallion
                  countryCode={activeCourse.countryCode}
                  languageCode={activeCourse.code}
                  accent={activeAccent}
                  learners={activeCourse.learners}
                />
              </div>
              <div className={styles.heroBody}>
                <span className={`${styles.heroEyebrow} font-nunito`}>
                  <Sparkles size={12} aria-hidden />
                  Your active passport
                </span>
                <h2 className={`${styles.heroTitle} font-fredoka`}>
                  <span
                    className={styles.heroTitleWord}
                    style={{ color: activeAccent }}
                  >
                    {activeCourse.label}
                  </span>
                </h2>
                <p className={`${styles.heroDesc} font-nunito`}>
                  Learn real-life {activeCourse.label} through short,
                  story-based lessons built for busy learners.
                </p>
                <div className={styles.heroProgressRow}>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} />
                  </div>
                  <span className={`${styles.heroXp} font-nunito`}>
                    <Zap size={12} fill="currentColor" strokeWidth={0} aria-hidden />
                    Level 1 · 0 XP
                  </span>
                </div>
                <motion.button
                  type="button"
                  className={`${styles.continueBtn} font-fredoka`}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  onClick={() => selectCourseAndContinue(activeCourse.code)}
                >
                  Continue
                </motion.button>
              </div>
            </section>
          ) : null}

          <section className={styles.gridSection}>
            <div className={styles.gridHead}>
              <p className={`${styles.gridLabel} font-nunito`}>More courses</p>
              <span className={styles.gridLine} aria-hidden />
              <button
                type="button"
                className={`${styles.showMoreBtn} font-nunito`}
                onClick={() => setShowAllCourses((prev) => !prev)}
              >
                {showAllCourses ? "Show fewer" : `Show all (${inactiveCourses.length})`}
              </button>
            </div>
            <div className={styles.courseGrid}>
              {visibleCourses.map((course, index) => (
                <motion.button
                  key={course.code}
                  type="button"
                  className={styles.courseCard}
                  style={
                    {
                      "--card-accent": getCourseAccent(course.code),
                    } as CSSProperties
                  }
                  whileHover={{ y: -3 }}
                  whileTap={{ y: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  onClick={() => selectCourseAndContinue(course.code)}
                >
                  <div className={styles.cardInner}>
                    <div className={styles.cardVisualStage}>
                      <div className={styles.cardFlagRow}>
                        <CourseFlagChip
                          countryCode={course.countryCode}
                          accent={getCourseAccent(course.code)}
                        />
                      </div>
                      <span className={`${styles.cardTag} font-nunito`}>
                        Course track
                      </span>
                      <span className={styles.cardHalo} aria-hidden />
                    </div>

                    <p className={`${styles.cardCode} font-nunito`}>
                      {course.code.toUpperCase()} · Level {index + 2}
                    </p>
                    <p className={`${styles.cardTitle} font-fredoka`}>
                      {course.label}
                    </p>
                    <p className={`${styles.cardLearners} font-nunito`}>
                      <Users size={12} strokeWidth={2.5} aria-hidden />
                      {course.learners} learners
                    </p>
                    {COURSE_BLURBS[course.code] ? (
                      <p className={`${styles.cardBlurb} font-nunito`}>
                        {COURSE_BLURBS[course.code]}
                      </p>
                    ) : null}

                    <div className={styles.cardProgress}>
                      <div className={styles.cardProgressTrack}>
                        <span
                          className={styles.cardProgressFill}
                          style={{
                            width: `${Math.min(88, 26 + index * 8)}%`,
                          }}
                        />
                      </div>
                      <span className={`${styles.cardProgressLabel} font-nunito`}>
                        Starter path
                      </span>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={`${styles.cardLevel} font-nunito`}>
                        Ready to unlock
                      </span>
                      <span className={`${styles.startPill} font-nunito`}>
                        Enter course
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
          </main>
        </div>
      </div>
    </LearnPageFrame>
  );
}
