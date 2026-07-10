"use client";

import { useEffect, useRef } from "react";

import type { AloudChapter, AloudWord } from "@/lib/library/library-read-aloud";

import styles from "./library-page-reader.module.css";

type Props = {
  chapter: AloudChapter | null;
  paragraphs: string[];
  words: AloudWord[];
  activeWordIndex: number | null;
  tracingPaused?: boolean;
  paragraphLead?: boolean;
};

export function LibraryHighlightedText({
  chapter,
  paragraphs,
  words,
  activeWordIndex,
  tracingPaused = false,
  paragraphLead = false,
}: Props) {
  const activeRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (tracingPaused) return;
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeWordIndex, tracingPaused]);

  const chapterWords = words.filter((word) => word.paragraphIndex === -1);
  const kickerWords = chapterWords.filter(
    (word) => word.text === "Chapter" || word.text === chapter?.number,
  );
  const titleWords = chapterWords.filter(
    (word) => word.text !== "Chapter" && word.text !== chapter?.number,
  );

  const wordsByParagraph = new Map<number, AloudWord[]>();
  for (const word of words) {
    if (word.paragraphIndex < 0) continue;
    const bucket = wordsByParagraph.get(word.paragraphIndex) ?? [];
    bucket.push(word);
    wordsByParagraph.set(word.paragraphIndex, bucket);
  }

  return (
    <>
      {chapter ? (
        <header className={styles.chapterHead}>
          <p className={styles.chapterKicker}>
            {kickerWords.map((word, index) => (
              <WordSpan
                key={word.index}
                word={word}
                activeWordIndex={activeWordIndex}
                tracingPaused={tracingPaused}
                activeRef={activeRef}
                trailingSpace={index < kickerWords.length - 1}
              />
            ))}
          </p>
          <h2 className={styles.chapterTitle}>
            {titleWords.map((word, index) => (
              <WordSpan
                key={word.index}
                word={word}
                activeWordIndex={activeWordIndex}
                tracingPaused={tracingPaused}
                activeRef={activeRef}
                trailingSpace={index < titleWords.length - 1}
              />
            ))}
          </h2>
        </header>
      ) : null}

      {paragraphs.map((paragraph, paragraphIndex) => {
        const paragraphWords = wordsByParagraph.get(paragraphIndex) ?? [];
        if (paragraphWords.length === 0) {
          return (
            <p
              key={paragraphIndex}
              className={`${styles.paragraph}${paragraphLead && paragraphIndex === 0 ? ` ${styles.paragraphLead}` : ""}`}
            >
              {paragraph}
            </p>
          );
        }

        return (
          <p
            key={paragraphIndex}
            className={`${styles.paragraph}${paragraphLead && paragraphIndex === 0 ? ` ${styles.paragraphLead}` : ""}`}
          >
            {paragraphWords.map((word, index) => (
              <WordSpan
                key={word.index}
                word={word}
                activeWordIndex={activeWordIndex}
                tracingPaused={tracingPaused}
                activeRef={activeRef}
                trailingSpace={index < paragraphWords.length - 1}
              />
            ))}
          </p>
        );
      })}
    </>
  );
}

function WordSpan({
  word,
  activeWordIndex,
  tracingPaused,
  activeRef,
  trailingSpace,
}: {
  word: AloudWord;
  activeWordIndex: number | null;
  tracingPaused: boolean;
  activeRef: React.MutableRefObject<HTMLSpanElement | null>;
  trailingSpace: boolean;
}) {
  const isActive = activeWordIndex === word.index;
  const isSpoken =
    activeWordIndex !== null && word.index >= 0 && word.index < activeWordIndex;

  const activeClass = isActive
    ? tracingPaused
      ? styles.wordPaused
      : styles.wordActive
    : "";

  return (
    <>
      <span
        ref={isActive ? activeRef : undefined}
        className={`${styles.word}${activeClass ? ` ${activeClass}` : ""}${isSpoken ? ` ${styles.wordSpoken}` : ""}`}
      >
        {word.text}
      </span>
      {trailingSpace ? " " : null}
    </>
  );
}
