"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  buildAloudSpread,
  createSpeechWordTracker,
  ensureSpeechVoicesReady,
  isReadAloudSupported,
  pickEnglishVoice,
  type AloudSpread,
  type SpeechWordTracker,
} from "@/lib/library/library-read-aloud";
import type { LibrarySpread } from "@/lib/library/library-catalog";

export type ReadAloudStatus = "idle" | "playing" | "paused" | "turning" | "unsupported";

const SPEECH_RATE = 0.92;

type Options = {
  spreadIndex: number;
  spread: LibrarySpread;
  useChapters: boolean;
  continuousRead: boolean;
  isLastSpread: boolean;
  onRequestNextSpread: () => void;
  onStoryFinished?: () => void;
};

export function useLibraryReadAloud({
  spreadIndex,
  spread,
  useChapters,
  continuousRead,
  isLastSpread,
  onRequestNextSpread,
  onStoryFinished,
}: Options) {
  const [status, setStatus] = useState<ReadAloudStatus>(() =>
    isReadAloudSupported() ? "idle" : "unsupported",
  );
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const spreadRef = useRef<AloudSpread>(buildAloudSpread(spread, useChapters));
  const trackerRef = useRef<SpeechWordTracker | null>(null);
  const spreadIndexRef = useRef(spreadIndex);
  const continuousReadRef = useRef(continuousRead);
  const onRequestNextSpreadRef = useRef(onRequestNextSpread);
  const onStoryFinishedRef = useRef(onStoryFinished);
  const cancelledRef = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const statusRef = useRef<ReadAloudStatus>(status);
  const isLastSpreadRef = useRef(isLastSpread);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    isLastSpreadRef.current = isLastSpread;
  }, [isLastSpread]);

  useEffect(() => {
    continuousReadRef.current = continuousRead;
  }, [continuousRead]);

  useEffect(() => {
    onRequestNextSpreadRef.current = onRequestNextSpread;
  }, [onRequestNextSpread]);

  useEffect(() => {
    onStoryFinishedRef.current = onStoryFinished;
  }, [onStoryFinished]);

  const finishSpread = useCallback(() => {
    trackerRef.current?.clear();
    utteranceRef.current = null;
    const aloud = spreadRef.current;
    const lastWord = aloud.words[aloud.words.length - 1];
    if (lastWord) setActiveWordIndex(lastWord.index);

    if (continuousReadRef.current && !isLastSpreadRef.current) {
      statusRef.current = "turning";
      setStatus("turning");
      window.setTimeout(() => {
        onRequestNextSpreadRef.current();
      }, 450);
      return;
    }

    if (continuousReadRef.current && isLastSpreadRef.current) {
      onStoryFinishedRef.current?.();
    }

    setActiveWordIndex(null);
    statusRef.current = "idle";
    setStatus("idle");
  }, []);

  const speakCurrentSpread = useCallback(() => {
    if (!isReadAloudSupported()) {
      setStatus("unsupported");
      return;
    }

    const run = async () => {
      const aloud = spreadRef.current;
      if (!aloud.speakText.trim()) return;

      cancelledRef.current = false;
      voiceRef.current = (await ensureSpeechVoicesReady()) ?? pickEnglishVoice();
      window.speechSynthesis.cancel();
      trackerRef.current?.clear();

      const utterance = new SpeechSynthesisUtterance(aloud.speakText);
      utterance.lang = "en-US";
      utterance.rate = SPEECH_RATE;
      utterance.pitch = 1.02;
      if (voiceRef.current) utterance.voice = voiceRef.current;

      const tracker = createSpeechWordTracker(
        aloud.charToWordIndex,
        (wordIndex) => {
          if (!cancelledRef.current && statusRef.current === "playing") {
            setActiveWordIndex(wordIndex);
          }
        },
        SPEECH_RATE,
      );
      trackerRef.current = tracker;

      utterance.onstart = () => {
        if (cancelledRef.current) return;
        statusRef.current = "playing";
        setStatus("playing");
        const first = aloud.words[0];
        if (first) setActiveWordIndex(first.index);
        tracker.start();
      };

      utterance.onboundary = (event) => {
        if (event.name === "word" || event.name === "sentence") {
          tracker.onBoundary(event.charIndex, event.elapsedTime);
        }
      };

      utterance.onend = () => {
        tracker.clear();
        utteranceRef.current = null;
        if (cancelledRef.current) return;
        finishSpread();
      };

      utterance.onerror = () => {
        tracker.clear();
        utteranceRef.current = null;
        if (cancelledRef.current) return;
        setActiveWordIndex(null);
        statusRef.current = "idle";
        setStatus("idle");
      };

      utteranceRef.current = utterance;
      statusRef.current = "playing";
      setStatus("playing");
      window.speechSynthesis.speak(utterance);
    };

    void run();
  }, [finishSpread]);

  const speakCurrentSpreadRef = useRef(speakCurrentSpread);
  speakCurrentSpreadRef.current = speakCurrentSpread;

  const stop = useCallback((nextStatus: ReadAloudStatus = "idle") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    cancelledRef.current = true;
    trackerRef.current?.clear();
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setActiveWordIndex(null);
    statusRef.current = isReadAloudSupported() ? nextStatus : "unsupported";
    setStatus(statusRef.current);
  }, []);

  useEffect(() => {
    const spreadChanged = spreadIndexRef.current !== spreadIndex;
    spreadIndexRef.current = spreadIndex;
    spreadRef.current = buildAloudSpread(spread, useChapters);

    cancelledRef.current = true;
    trackerRef.current?.clear();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setActiveWordIndex(null);

    if (continuousReadRef.current && spreadChanged) {
      cancelledRef.current = false;
      const timer = window.setTimeout(() => {
        speakCurrentSpreadRef.current();
      }, 120);
      return () => window.clearTimeout(timer);
    }

    if (!continuousReadRef.current) {
      statusRef.current = isReadAloudSupported() ? "idle" : "unsupported";
      setStatus(statusRef.current);
    }
  }, [spreadIndex, spread, useChapters]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      trackerRef.current?.clear();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!isReadAloudSupported()) return;
    const warmVoices = () => {
      voiceRef.current = pickEnglishVoice();
    };
    warmVoices();
    window.speechSynthesis.addEventListener("voiceschanged", warmVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", warmVoices);
  }, []);

  const pause = useCallback(() => {
    if (!isReadAloudSupported()) return;
    trackerRef.current?.pause();
    window.speechSynthesis.pause();
    statusRef.current = "paused";
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (!isReadAloudSupported()) return;
    statusRef.current = "playing";
    setStatus("playing");
    window.speechSynthesis.resume();
    trackerRef.current?.resume();
  }, []);

  const toggle = useCallback(() => {
    if (status === "playing") {
      pause();
      return;
    }
    if (status === "paused") {
      resume();
      return;
    }
    if (status === "turning") return;
    speakCurrentSpread();
  }, [pause, resume, speakCurrentSpread, status]);

  return {
    status,
    activeWordIndex,
    toggle,
    stop,
    speakCurrentSpread,
    pause,
    resume,
    supported: status !== "unsupported",
  };
}
