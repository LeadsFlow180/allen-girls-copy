"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { useWindowSize } from "react-use";
import section1Units from "./section1-units.json";
import styles from "./LessonSession.module.css";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type StepKind = "start" | "lesson" | "chest" | "practice" | "review";
type QuestionType = "multiple_choice" | "fill_blank" | "column_match" | "picture_choice";

interface UnitStepSessionProps {
  sectionIndex: number;
  unitIndex: number;
  dbUnitId?: number;
  step: StepKind;
  activeLanguage: string;
  onStepPassed: () => void;
  onComplete: () => void;
  onClose: () => void;
}

const STORY_THEMES = [
  {
    bg: "linear-gradient(180deg, #0369a1 0%, #0f766e 100%)",
    text: "#ecfeff",
    subText: "rgba(236, 254, 255, 0.88)",
    chipBg: "rgba(240, 253, 250, 0.18)",
    chipText: "#ecfeff",
    progressTrack: "rgba(236, 254, 255, 0.3)",
    progressFill: "#34d399",
  },
  {
    bg: "linear-gradient(180deg, #312e81 0%, #1d4ed8 100%)",
    text: "#eef2ff",
    subText: "rgba(238, 242, 255, 0.86)",
    chipBg: "rgba(224, 231, 255, 0.18)",
    chipText: "#eef2ff",
    progressTrack: "rgba(224, 231, 255, 0.3)",
    progressFill: "#a3e635",
  },
  {
    bg: "linear-gradient(180deg, #7c2d12 0%, #b45309 100%)",
    text: "#fffbeb",
    subText: "rgba(255, 251, 235, 0.88)",
    chipBg: "rgba(254, 243, 199, 0.18)",
    chipText: "#fffbeb",
    progressTrack: "rgba(254, 243, 199, 0.3)",
    progressFill: "#facc15",
  },
  {
    bg: "linear-gradient(180deg, #9d174d 0%, #be185d 100%)",
    text: "#fdf2f8",
    subText: "rgba(253, 242, 248, 0.88)",
    chipBg: "rgba(251, 207, 232, 0.2)",
    chipText: "#fdf2f8",
    progressTrack: "rgba(251, 207, 232, 0.32)",
    progressFill: "#22d3ee",
  },
];

function getTtsLang(code: string): string {
  switch (code) {
    case "es":
      return "es-ES";
    case "fr":
      return "fr-FR";
    case "ar":
      return "ar-SA";
    case "ur":
      return "ur-PK";
    case "en":
    default:
      return "en-US";
  }
}

function speak(text: string, langCode: string) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function extractEmoji(text: string): string {
  const emojiMatch = text.match(
    /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u
  );
  return emojiMatch?.[0] ?? "✨";
}

function removeEmojis(text: string): string {
  return text
    .replace(/(\p{Extended_Pictographic}|\p{Emoji_Presentation})/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getDeterministicSeed(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function sortAnswersForDisplay(
  answers: any[],
  questionKey: string
): any[] {
  const shift = answers.length
    ? getDeterministicSeed(questionKey) % answers.length
    : 0;
  return answers.map((answer, index) => ({
    answer,
    index,
    rank: (index + shift) % Math.max(1, answers.length),
  }))
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.answer);
}

function getQuestionType(type: string | undefined): QuestionType {
  if (type === "fill_blank" || type === "column_match" || type === "picture_choice") {
    return type;
  }
  return "multiple_choice";
}

function deriveActivityType(question: any, index: number): QuestionType {
  const explicit = getQuestionType(question?.type);
  if (question?.type && explicit !== "multiple_choice") return explicit;
  const fallbackCycle: QuestionType[] = [
    "multiple_choice",
    "fill_blank",
    "column_match",
  ];
  return fallbackCycle[index % fallbackCycle.length];
}

function getFillBlankPreview(question: any, correctAnswer: string): string {
  const words = (correctAnswer || "").split(/\s+/).filter(Boolean);
  if (words.length <= 1) return question?.prompt ?? "Fill in the blank.";
  const blankAt = Math.min(1, words.length - 1);
  words[blankAt] = "_____";
  return words.join(" ");
}

export default function UnitStepSession({
  sectionIndex,
  unitIndex,
  dbUnitId,
  step,
  activeLanguage,
  onStepPassed,
  onComplete,
  onClose,
}: UnitStepSessionProps) {
  const section: any = section1Units;
  const unit = section?.units?.[unitIndex];
  const stepContent = unit?.steps?.find((s: any) => s.kind === step);
  const allQuestions: any[] = stepContent?.questions ?? [];

  // filter by language if possible
  const languageFiltered =
    allQuestions.filter((q) => q.toLanguage === activeLanguage) || [];
  const fallbackQuestions =
    languageFiltered.length > 0 ? languageFiltered : allQuestions;
  const [questions, setQuestions] = useState<any[]>(fallbackQuestions);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [stepRecorded, setStepRecorded] = useState(false);
  const [questionSource, setQuestionSource] = useState<"db" | "fallback">(
    "fallback"
  );
  const [hasLoggedSource, setHasLoggedSource] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    setQuestions(fallbackQuestions);
  }, [unitIndex, step, activeLanguage]);

  useEffect(() => {
    setIndex(0);
    setSelectedId(null);
    setChecked(false);
    setFeedback(null);
    setShowResult(false);
    setStepRecorded(false);
    setQuestionSource("fallback");
    setHasLoggedSource(false);
  }, [unitIndex, step, activeLanguage, dbUnitId]);

  useEffect(() => {
    let isMounted = true;

    const loadStepQuestions = async () => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;

      setIsLoadingQuestions(true);
      try {
        const resolveUnitIdForActiveLanguage = async () => {
          const { data: languageRow } = await supabase
            .from("learning_languages")
            .select("id")
            .eq("code", activeLanguage)
            .eq("is_active", true)
            .maybeSingle();
          if (!languageRow?.id || !isMounted) return null;

          const { data: courseRow } = await supabase
            .from("language_courses")
            .select("id")
            .eq("language_id", languageRow.id)
            .eq("is_published", true)
            .order("sort_order", { ascending: true })
            .limit(1)
            .maybeSingle();
          if (!courseRow?.id || !isMounted) return null;

          const { data: sectionRows } = await supabase
            .from("learning_sections")
            .select("id")
            .eq("language_course_id", courseRow.id)
            .eq("is_published", true)
            .order("sort_order", { ascending: true });
          const sectionRow = sectionRows?.[Math.max(0, sectionIndex - 1)];
          if (!sectionRow?.id || !isMounted) return null;

          const { data: unitRows } = await supabase
            .from("learning_units")
            .select("id")
            .eq("learning_section_id", sectionRow.id)
            .eq("is_published", true)
            .order("sort_order", { ascending: true });
          const resolved = unitRows?.[unitIndex]?.id ?? null;
          return resolved;
        };

        const fetchByStatus = async (
          stepId: number,
          status: "approved" | "reviewed" | "draft"
        ) => {
          const { data } = await supabase
            .from("learning_questions")
            .select(
              "id, prompt, question_type, from_language, to_language, tts_text, tts_lang, explanation, sort_order, learning_question_options(id, option_key, answer_text, image_src, is_correct, sort_order)"
            )
            .eq("learning_step_id", stepId)
            .eq("to_language", activeLanguage)
            .eq("quality_status", status)
            .order("sort_order", { ascending: true });
          return data ?? [];
        };

        const getRowsForUnit = async (unitId: number) => {
          const { data: stepRow } = await supabase
            .from("learning_steps")
            .select("id")
            .eq("learning_unit_id", unitId)
            .eq("kind", step)
            .eq("is_published", true)
            .maybeSingle();
          if (!stepRow?.id || !isMounted) return { selectedRows: [], source: "none" as const };

          // Reason: prioritize approved/reviewed, but allow draft so newly seeded languages load.
          const approvedQuestions = await fetchByStatus(stepRow.id, "approved");
          const reviewedQuestions = approvedQuestions.length
            ? []
            : await fetchByStatus(stepRow.id, "reviewed");
          const draftQuestions =
            approvedQuestions.length || reviewedQuestions.length
              ? []
              : await fetchByStatus(stepRow.id, "draft");
          const selectedRows =
            approvedQuestions.length > 0
              ? approvedQuestions
              : reviewedQuestions.length > 0
              ? reviewedQuestions
              : draftQuestions;

          const source =
            approvedQuestions.length > 0
              ? "approved"
              : reviewedQuestions.length > 0
              ? "reviewed"
              : draftQuestions.length > 0
              ? "draft"
              : "none";
          return { selectedRows, source };
        };

        let resolvedUnitId = dbUnitId ?? (await resolveUnitIdForActiveLanguage());
        if (!resolvedUnitId || !isMounted) return;

        let { selectedRows, source } = await getRowsForUnit(resolvedUnitId);
        if (!selectedRows.length) {
          // Retry with language-resolved unit id in case UI passed stale unit id from previous language.
          const languageUnitId = await resolveUnitIdForActiveLanguage();
          if (languageUnitId && languageUnitId !== resolvedUnitId) {
            resolvedUnitId = languageUnitId;
            const retried = await getRowsForUnit(resolvedUnitId);
            selectedRows = retried.selectedRows;
            source = retried.source;
          }
        }
        if (!selectedRows.length || !isMounted) return;

        console.log(
          `[LessonSession] Questions source: DB (${source})`,
          {
            sectionIndex,
            unitIndex,
            dbUnitId: resolvedUnitId,
            step,
            count: selectedRows.length,
            activeLanguage,
          }
        );
        setHasLoggedSource(true);

        const mappedQuestions = selectedRows.map((question: any) => {
          const answers = (question.learning_question_options ?? [])
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((option: any) => ({
              id: `q${question.id}-${option.option_key}`,
              text: option.answer_text,
              image: option.image_src ?? undefined,
              correct: option.is_correct,
            }));

          return {
            id: `q${question.id}`,
            type: question.question_type ?? "multiple_choice",
            fromLanguage: question.from_language ?? "en",
            toLanguage: question.to_language ?? activeLanguage,
            prompt: question.prompt,
            answers,
            ttsText: question.tts_text ?? undefined,
            ttsLang: question.tts_lang ?? undefined,
            explanation: question.explanation ?? "",
          };
        });

        setQuestionSource("db");
        setQuestions(mappedQuestions);
      } finally {
        if (isMounted) setIsLoadingQuestions(false);
      }
    };

    void loadStepQuestions();

    return () => {
      isMounted = false;
    };
  }, [sectionIndex, unitIndex, step, activeLanguage, dbUnitId]);

  useEffect(() => {
    if (
      !isLoadingQuestions &&
      questions.length > 0 &&
      questionSource === "fallback" &&
      !hasLoggedSource
    ) {
      console.log("[LessonSession] Questions source: fallback JSON", {
        sectionIndex,
        unitIndex,
        step,
        count: questions.length,
        activeLanguage,
      });
      setHasLoggedSource(true);
    }
  }, [
    isLoadingQuestions,
    questions.length,
    questionSource,
    hasLoggedSource,
    sectionIndex,
    unitIndex,
    step,
    activeLanguage,
  ]);

  const q = questions[index];
  const displayedAnswers = q
    ? sortAnswersForDisplay(q.answers ?? [], `${q.id}-${activeLanguage}`)
    : [];
  const questionType = q ? deriveActivityType(q, index) : "multiple_choice";
  const correctAnswerText =
    displayedAnswers.find((answer: any) => answer.correct)?.text ?? "";
  const fillBlankPrompt = getFillBlankPreview(q, correctAnswerText);
  const total = questions.length;

  if (!unit) return null;

  if (isLoadingQuestions || !questions.length || !q) {
    return (
      <div className={styles.overlay}>
        <div
          style={{
            width: "min(680px, 92vw)",
            borderRadius: "1.2rem",
            background:
              "linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.96) 100%)",
            border: "1px solid rgba(148,163,184,0.35)",
            boxShadow: "0 24px 54px rgba(2,6,23,0.45)",
            padding: "1.4rem 1.25rem",
            color: "#e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: [0, 18, 0], opacity: 1 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: "2rem", lineHeight: 1 }}
            aria-hidden
          >
            🧒💨
          </motion.div>
          <p
            className="font-fredoka"
            style={{
              margin: 0,
              fontSize: "1.02rem",
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: "0.02em",
            }}
          >
            Getting your quiz ready...
          </p>
          <div style={{ display: "flex", gap: "0.4rem" }} aria-hidden>
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                animate={{ y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
                transition={{
                  duration: 0.75,
                  repeat: Infinity,
                  delay: dot * 0.12,
                  ease: "easeInOut",
                }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "999px",
                  background: "#38bdf8",
                  display: "inline-block",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const REWARDS: Record<StepKind, { xp: number; chest: boolean }> = {
    start: { xp: 10, chest: false },
    lesson: { xp: 15, chest: false },
    chest: { xp: 15, chest: true },
    practice: { xp: 15, chest: false },
    review: { xp: 20, chest: false },
  };

  const reward = REWARDS[step];

  const handleSelect = (answer: any) => {
    if (feedback === "wrong") {
      setChecked(false);
      setFeedback(null);
    }
    setSelectedId(answer.id);

    const speakText = q.ttsText || answer.text;
    const speakLang =
      q.ttsLang || getTtsLang(q.toLanguage || activeLanguage);

    speak(speakText, speakLang);
  };

  const handleCheck = () => {
    if (!selectedId) return;
    setChecked(true);

    const selectedAnswer = displayedAnswers.find((a: any) => a.id === selectedId);
    const correct = selectedAnswer?.correct;

    if (correct) {
      setFeedback("correct");
      const isLast = index === total - 1;
      if (isLast) {
        if (!stepRecorded) {
          // Reason: record completion immediately after final correct answer.
          onStepPassed();
          setStepRecorded(true);
        }
        // Show result in-place (same full-screen layout) instead of closing immediately.
        setShowResult(true);
      } else {
        // brief delay so user can see correct state
        setTimeout(() => {
          setIndex((prev) => prev + 1);
          setSelectedId(null);
          setChecked(false);
          setFeedback(null);
        }, 600);
      }
    } else {
      setFeedback("wrong");
    }
  };

  const progressPercent = showResult ? 100 : ((index + 1) / total) * 100;
  const stepLabel =
    step === "start"
      ? "Warm-up"
      : step === "lesson"
      ? "Lesson"
      : step === "chest"
      ? "Chest"
      : step === "practice"
      ? "Practice"
      : "Review";

  const stepSubtitle =
    step === "start"
      ? "Story warm-up"
      : step === "lesson"
      ? "Core lesson"
      : step === "chest"
      ? "Reward chest"
      : step === "practice"
      ? "Quick practice"
      : "Final review";
  const activeTheme = STORY_THEMES[index % STORY_THEMES.length];
  const storyThemeStyle = {
    "--story-bg": activeTheme.bg,
    "--story-text": activeTheme.text,
    "--story-subtext": activeTheme.subText,
    "--story-chip-bg": activeTheme.chipBg,
    "--story-chip-text": activeTheme.chipText,
    "--story-progress-track": activeTheme.progressTrack,
    "--story-progress-fill": activeTheme.progressFill,
  } as CSSProperties;

  return (
    <div className={styles.overlay}>
      {feedback === "correct" && width > 0 && height > 0 && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={180}
          gravity={0.22}
          tweenDuration={700}
          confettiSource={{ x: 0, y: 0, w: width, h: 0 }}
          className={styles.confettiCanvas}
        />
      )}
      <div className={styles.shell}>
        <section className={styles.storyPanel} style={storyThemeStyle}>
          <div className={styles.storyGlow} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close session"
            className={styles.closeButton}
          >
            ×
          </button>
          <div className={styles.storyTop}>
            <span className={styles.stepChip}>{stepLabel}</span>
            <span className={styles.questionCount}>
              {index + 1} / {total}
            </span>
          </div>
          <p className={styles.subtitle}>{stepSubtitle}</p>
          <h2 className={styles.prompt}>
            {showResult
              ? reward.chest
                ? "Chest unlocked!"
                : "Mission complete!"
              : q.prompt}
          </h2>
          <div className={styles.progressBlock}>
            <div className={styles.progressMeta}>
              <span>{showResult ? "Lesson progress" : "Story progress"}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className={styles.storyFooter}>
            <p className={styles.timerLabel}>Timer remaining</p>
            <p className={styles.timerValue}>{showResult ? "Done" : "0:20"}</p>
          </div>
        </section>

        <section
          className={`${styles.quizPanel} ${
            feedback === "wrong" ? styles.quizPanelWrong : ""
          } ${showResult ? styles.quizPanelResult : ""}`}
        >
          {feedback === "correct" && !showResult && (
            <div className={styles.successBanner} aria-live="polite">
              <span className={styles.successIcon}>✓</span>
              <span>Correct! Great choice.</span>
            </div>
          )}
          <header className={styles.quizHeader}>
            <div>
              <p className={styles.quizLabel}>
                {showResult ? "Result" : "Quiz questions"}
              </p>
              <p className={styles.quizHint}>
                {showResult
                  ? "You earned your reward"
                  : "Select one option below"}
              </p>
            </div>
            <div className={styles.lives}>❤ 5</div>
          </header>

          {showResult ? (
            <div className={styles.resultWrap}>
              <div className={styles.resultHero} aria-live="polite">
                <div className={styles.resultHeroIcon}>
                  {reward.chest ? "🎁" : "🏆"}
                </div>
                <div className={styles.resultHeroText}>
                  <div className={styles.resultHeroTop}>
                    You earned your reward
                  </div>
                  <div className={styles.resultHeroMain}>
                    +{reward.xp} XP {reward.chest ? "and a chest" : "for completing!"}
                  </div>
                </div>
              </div>
              <div className={styles.resultGrid}>
                <div
                  className={`${styles.resultCard} ${styles.resultCardXp}`}
                >
                  <p className={styles.resultLabel}>XP earned</p>
                  <p className={styles.resultValue}>+{reward.xp} XP</p>
                </div>
                <div
                  className={`${styles.resultCard} ${reward.chest ? styles.resultCardChest : styles.resultCardReward}`}
                >
                  <p className={styles.resultLabel}>{reward.chest ? "Chest" : "Reward"}</p>
                  <p className={styles.resultValue}>
                    {reward.chest ? "🎁" : "🏆"} {reward.chest ? "Unlocked" : "Done"}
                  </p>
                </div>
              </div>

              <div className={styles.resultHelp}>
                Great job! Keep going to unlock the next part of your lesson path.
              </div>

              <footer className={styles.resultActions}>
                <button type="button" onClick={onComplete} className={styles.checkButton}>
                  Next step
                </button>
                <button type="button" onClick={onClose} className={styles.skipButton}>
                  Close
                </button>
              </footer>
            </div>
          ) : (
            <>
              <p className={styles.questionLead}>
                {questionType === "fill_blank"
                  ? "Fill in the blank"
                  : questionType === "column_match"
                  ? "Column matching"
                  : "Choose the correct translation"}
              </p>
              <div
                style={{
                  marginBottom: "0.6rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.26rem 0.55rem",
                  borderRadius: "999px",
                  background:
                    questionType === "fill_blank"
                      ? "#ecfdf5"
                      : questionType === "column_match"
                      ? "#eff6ff"
                      : "#f1f5f9",
                  color:
                    questionType === "fill_blank"
                      ? "#065f46"
                      : questionType === "column_match"
                      ? "#1e3a8a"
                      : "#334155",
                  border: "1px solid #dbeafe",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Mode: {questionType.replace("_", " ")}
              </div>
              {questionType === "column_match" && (
                <div
                  style={{
                    marginBottom: "0.7rem",
                    padding: "0.55rem 0.7rem",
                    borderRadius: "0.7rem",
                    border: "1px solid #dbeafe",
                    background: "linear-gradient(180deg,#eff6ff,#ffffff)",
                    fontSize: "0.82rem",
                    color: "#1e3a8a",
                    fontWeight: 700,
                  }}
                >
                  Match this phrase:
                  <span style={{ fontWeight: 800 }}> {q.prompt}</span>
                </div>
              )}
              {questionType === "fill_blank" && (
                <div
                  style={{
                    marginBottom: "0.7rem",
                    padding: "0.55rem 0.7rem",
                    borderRadius: "0.7rem",
                    border: "1px solid #d1fae5",
                    background: "linear-gradient(180deg,#ecfdf5,#ffffff)",
                    fontSize: "0.82rem",
                    color: "#065f46",
                    fontWeight: 700,
                  }}
                >
                  Fill the missing part: <span style={{ fontWeight: 900 }}>{fillBlankPrompt}</span>
                </div>
              )}
              <div
                className={styles.answers}
                style={
                  questionType === "column_match"
                    ? {
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.7rem",
                      }
                    : undefined
                }
              >
                {displayedAnswers.map((ans: any, idx: number) => {
                  const isSelected = selectedId === ans.id;
                  const isCorrect = ans.correct;
                  const emoji = extractEmoji(ans.text);
                  const answerLabel = removeEmojis(ans.text);

                  const stateClass = checked
                    ? isCorrect
                      ? styles.answerCorrect
                      : isSelected
                      ? styles.answerWrong
                      : ""
                    : isSelected
                    ? styles.answerSelected
                    : "";

                  const letter = String.fromCharCode(65 + idx);
                  const rightMark = checked
                    ? isCorrect
                      ? "✓"
                      : isSelected
                      ? "✕"
                      : ""
                    : "";

                  return (
                    <button
                      key={ans.id}
                      type="button"
                      onClick={() => handleSelect(ans)}
                      className={`${styles.answer} ${stateClass}`}
                      style={
                        questionType === "column_match"
                          ? {
                              minHeight: 88,
                              transformStyle: "preserve-3d",
                              boxShadow: isSelected
                                ? "0 10px 18px rgba(14,165,233,0.22)"
                                : "0 8px 16px rgba(15,23,42,0.08)",
                            }
                          : undefined
                      }
                    >
                      <span className={styles.answerRadio} aria-hidden="true">
                        <span className={styles.answerRadioDot} />
                      </span>
                      <span
                        className={styles.emojiBadge}
                        aria-hidden="true"
                        title={letter}
                      >
                        {emoji}
                      </span>
                      <span className={styles.answerText}>{answerLabel}</span>
                      {rightMark ? (
                        <span className={styles.answerRightMark} aria-hidden="true">
                          {rightMark}
                        </span>
                      ) : (
                        <span
                          className={styles.answerRightMarkSpacer}
                          aria-hidden="true"
                        >
                          &nbsp;
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <footer className={styles.actions}>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.skipButton}
                >
                  Skip
                </button>
                <button
                  type="button"
                  disabled={!selectedId}
                  onClick={handleCheck}
                  className={styles.checkButton}
                >
                  Check
                </button>
              </footer>
              {feedback === "wrong" && (
                <p className={styles.feedbackTextWrong}>
                  Not quite. Try a different option.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

