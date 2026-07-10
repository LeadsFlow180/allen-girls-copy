import type { LibrarySpread } from "./library-catalog";

export type AloudChapter = {
  number: string;
  title: string;
};

export type AloudWord = {
  index: number;
  text: string;
  paragraphIndex: number;
};

export type AloudPage = {
  side: "left" | "right";
  chapter: AloudChapter | null;
  paragraphs: string[];
  words: AloudWord[];
  wordStartIndex: number;
};

export type AloudSpread = {
  pages: AloudPage[];
  words: AloudWord[];
  speakText: string;
  charToWordIndex: number[];
};

function parseChapterLine(line: string): AloudChapter | null {
  const match = line.match(/^chapter\s+(\d+)\s*[—–-]\s*(.+)$/i);
  if (!match) return null;
  return { number: match[1]!, title: match[2]!.trim() };
}

export function parsePageText(
  text: string,
  useChapters: boolean,
): { chapter: AloudChapter | null; paragraphs: string[] } {
  const lines = text.split("\n");
  const firstLine = lines[0]?.trim() ?? "";
  const chapter = useChapters ? parseChapterLine(firstLine) : null;
  const bodyText = (chapter ? lines.slice(1) : lines).join("\n").trim();
  const paragraphs = bodyText.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return { chapter, paragraphs };
}

function tokenizeParagraphs(
  paragraphs: string[],
  startIndex: number,
  chapter: AloudChapter | null,
): AloudWord[] {
  const words: AloudWord[] = [];
  let index = startIndex;

  if (chapter) {
    words.push({ index: index++, text: "Chapter", paragraphIndex: -1 });
    words.push({ index: index++, text: chapter.number, paragraphIndex: -1 });
    chapter.title
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((text) => {
        words.push({ index: index++, text, paragraphIndex: -1 });
      });
  }

  paragraphs.forEach((paragraph, paragraphIndex) => {
    paragraph
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((text) => {
        words.push({ index: index++, text, paragraphIndex });
      });
  });

  return words;
}

function buildSpeakMaps(words: AloudWord[]): { speakText: string; charToWordIndex: number[] } {
  const parts = words.map((word) => word.text);
  const speakText = parts.join(" ");
  const charToWordIndex: number[] = [];

  let position = 0;
  for (const word of words) {
    for (let i = 0; i < word.text.length; i += 1) {
      charToWordIndex[position + i] = word.index;
    }
    position += word.text.length;
    if (position < speakText.length) {
      charToWordIndex[position] = word.index;
      position += 1;
    }
  }

  return { speakText, charToWordIndex };
}

export type AloudPhrase = {
  words: AloudWord[];
  speakText: string;
  charToWordIndex: number[];
};

const PHRASE_END_RE = /[.!?]["']?$/;
const CLAUSE_END_RE = /[,;:]["']?$/;
const MAX_PHRASE_WORDS = 18;
const CLAUSE_BREAK_WORDS = 10;

/** Group tokens into short phrases so TTS sounds like natural storytelling. */
export function groupWordsIntoPhrases(words: AloudWord[]): AloudWord[][] {
  const phrases: AloudWord[][] = [];
  let current: AloudWord[] = [];

  for (const word of words) {
    current.push(word);
    const atSentenceEnd = PHRASE_END_RE.test(word.text);
    const atClause = CLAUSE_END_RE.test(word.text) && current.length >= CLAUSE_BREAK_WORDS;
    const atMax = current.length >= MAX_PHRASE_WORDS;

    if (atSentenceEnd || atClause || atMax) {
      phrases.push(current);
      current = [];
    }
  }

  if (current.length) phrases.push(current);
  return phrases;
}

export function buildAloudPhrases(words: AloudWord[]): AloudPhrase[] {
  return groupWordsIntoPhrases(words).map((phraseWords) => {
    const { speakText, charToWordIndex } = buildSpeakMaps(phraseWords);
    return { words: phraseWords, speakText, charToWordIndex };
  });
}

export type SpeechWordTracker = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  onBoundary: (charIndex: number, elapsedTime?: number) => void;
  clear: () => void;
};

/** Smooth storytelling voice + frame-synced highlights, resynced on speech boundaries. */
export function createSpeechWordTracker(
  charToWordIndex: number[],
  onWord: (wordIndex: number) => void,
  speechRate = 0.92,
): SpeechWordTracker {
  let rafId = 0;
  let running = false;
  let virtualCharPos = 0;
  let lastFrameMs = 0;
  let boundaryCount = 0;
  let timerOnlyMode = false;
  let boundaryProbeId = 0;

  // Reason: ~150 wpm ≈ 15 chars/sec at rate 1.0; tuned up slightly so highlight stays with voice.
  let charsPerSecond = 14.2 * speechRate;

  const highlightAtChar = (charPos: number) => {
    const lead = boundaryCount > 1 ? 0 : timerOnlyMode ? 5 : 3;
    const index = Math.max(0, Math.floor(charPos + lead));
    const wordIndex = findWordIndexAtChar(charToWordIndex, index);
    if (wordIndex !== null) onWord(wordIndex);
  };

  const tick = (now: number) => {
    if (!running) return;

    if (lastFrameMs > 0) {
      const deltaSec = (now - lastFrameMs) / 1000;
      virtualCharPos += deltaSec * charsPerSecond;
      highlightAtChar(virtualCharPos);
    }

    lastFrameMs = now;
    rafId = window.requestAnimationFrame(tick);
  };

  return {
    start: () => {
      running = true;
      virtualCharPos = 0;
      lastFrameMs = 0;
      boundaryCount = 0;
      timerOnlyMode = false;
      charsPerSecond = 14.2 * speechRate;
      window.clearTimeout(boundaryProbeId);
      boundaryProbeId = window.setTimeout(() => {
        if (boundaryCount === 0) timerOnlyMode = true;
      }, 1800);

      rafId = window.requestAnimationFrame(tick);
    },
    pause: () => {
      running = false;
      window.cancelAnimationFrame(rafId);
      lastFrameMs = 0;
    },
    resume: () => {
      if (running) return;
      running = true;
      lastFrameMs = 0;
      rafId = window.requestAnimationFrame(tick);
    },
    onBoundary: (charIndex: number, elapsedTime?: number) => {
      boundaryCount += 1;
      timerOnlyMode = false;
      virtualCharPos = charIndex;

      if (elapsedTime && elapsedTime > 0.08 && charIndex > 0) {
        const measured = charIndex / elapsedTime;
        charsPerSecond = charsPerSecond * 0.25 + measured * 0.75;
      }

      highlightAtChar(charIndex);
    },
    clear: () => {
      running = false;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(boundaryProbeId);
      lastFrameMs = 0;
      virtualCharPos = 0;
      boundaryCount = 0;
      timerOnlyMode = false;
    },
  };
}

/** Map a speech boundary char offset to the nearest spoken word index. */
export function findWordIndexAtChar(charToWordIndex: number[], charIndex: number): number | null {
  if (charToWordIndex.length === 0) return null;

  const direct = charToWordIndex[charIndex];
  if (direct !== undefined) return direct;

  const clamped = Math.min(Math.max(charIndex, 0), charToWordIndex.length - 1);
  for (let i = clamped; i >= 0; i -= 1) {
    const candidate = charToWordIndex[i];
    if (candidate !== undefined) return candidate;
  }

  return charToWordIndex.find((value) => value !== undefined) ?? null;
}

function buildAloudPage(
  side: "left" | "right",
  text: string,
  useChapters: boolean,
  wordStartIndex: number,
): { page: AloudPage; nextIndex: number } {
  const { chapter, paragraphs } = parsePageText(text, useChapters);
  const words = tokenizeParagraphs(paragraphs, wordStartIndex, chapter);
  const nextIndex = words.length > 0 ? words[words.length - 1]!.index + 1 : wordStartIndex;

  return {
    page: {
      side,
      chapter,
      paragraphs,
      words,
      wordStartIndex,
    },
    nextIndex,
  };
}

export function buildAloudSpread(
  spread: LibrarySpread,
  useChapters: boolean,
): AloudSpread {
  const pages: AloudPage[] = [];
  let wordStartIndex = 0;

  if (spread.left) {
    const left = buildAloudPage("left", spread.left, useChapters, wordStartIndex);
    pages.push(left.page);
    wordStartIndex = left.nextIndex;
  }

  const right = buildAloudPage("right", spread.right, useChapters, wordStartIndex);
  pages.push(right.page);

  const words = pages.flatMap((page) => page.words);
  const { speakText, charToWordIndex } = buildSpeakMaps(words);

  return { pages, words, speakText, charToWordIndex };
}

export function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  if (english.length === 0) return null;

  // Reason: cloud/Google voices often skip boundary events, which breaks word tracking.
  const local = english.filter((voice) => voice.localService);
  const localPreferred =
    local.find((voice) => /samantha|zira|david|microsoft.*natural|karen|moira|daniel/i.test(voice.name)) ??
    local.find((voice) => voice.default) ??
    local[0];
  if (localPreferred) return localPreferred;

  return (
    english.find((voice) => /samantha|natural|zira/i.test(voice.name)) ??
    english.find((voice) => voice.default) ??
    english[0] ??
    null
  );
}

export function isReadAloudSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Chrome may return zero voices until the list is warmed once. */
export function ensureSpeechVoicesReady(): Promise<SpeechSynthesisVoice | null> {
  if (!isReadAloudSupported()) return Promise.resolve(null);

  const existing = pickEnglishVoice();
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const onVoices = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve(pickEnglishVoice());
    };

    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    window.speechSynthesis.getVoices();
    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve(pickEnglishVoice());
    }, 400);
  });
}
