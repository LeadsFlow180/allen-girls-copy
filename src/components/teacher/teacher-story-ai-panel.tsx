"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { LIBRARY_STORY_AI_MAX_CHAPTERS } from "@/lib/library/library-story-ai";

import styles from "./teacher-library.module.css";

export type TeacherStoryAiResult = {
  title: string;
  storyId: string;
  author: string;
  synopsis: string;
  ageBand: string;
  tier: "standard" | "vip";
  useChapters: boolean;
  chapters: string[];
  body: string;
  coverImage: { base64: string; mimeType: string } | null;
  coverImageError: string | null;
};

type Props = {
  mode: "create" | "edit";
  title: string;
  synopsis: string;
  ageBand: string;
  wing: "allen_girls" | "licensed";
  useChapters: boolean;
  onGenerated: (result: TeacherStoryAiResult) => void;
};

function coverExtensionFromMime(mimeType: string): string {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}

function formatAiError(code?: string, detail?: string): string {
  switch (code) {
    case "gemini_not_configured":
      return "GEMINI_API_KEY is not set on the server. Add it to .env.local and restart.";
    case "invalid_request":
      return "Check your prompt and chapter count, then try again.";
    case "incomplete_chapters":
      return "Not all chapters were generated. Try fewer chapters or run again.";
    case "generation_failed":
      return detail ?? "Story generation failed. Try again in a moment.";
    default:
      return code ?? "Could not generate story.";
  }
}

export function TeacherStoryAiPanel({
  mode,
  title,
  synopsis,
  ageBand,
  wing,
  useChapters,
  onGenerated,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [chapterCount, setChapterCount] = useState(5);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (trimmed.length < 12) {
      setStatus("error");
      setMessage("Describe the story you want (at least a sentence or two).");
      return;
    }

    setStatus("loading");
    setMessage(
      useChapters
        ? `Generating title, synopsis, cover art, and ${chapterCount} full chapters… This can take 2–4 minutes.`
        : "Generating title, synopsis, cover art, and full story… This can take 1–2 minutes.",
    );

    try {
      const res = await fetch("/api/teacher/library/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          chapterCount: useChapters ? chapterCount : 1,
          singleStory: !useChapters,
          title: title.trim() || undefined,
          synopsis: synopsis.trim() || undefined,
          ageBand: ageBand.trim() || undefined,
          wing,
        }),
      });

      const json = (await res.json()) as TeacherStoryAiResult & {
        error?: string;
        detail?: string;
        generated?: number;
        requested?: number;
      };

      if (!res.ok) {
        setStatus("error");
        setMessage(formatAiError(json.error, json.detail));
        if (json.error === "incomplete_chapters" && json.chapters?.length) {
          onGenerated(json as TeacherStoryAiResult);
        }
        return;
      }

      onGenerated(json);

      const coverNote = json.coverImage
        ? " Cover thumbnail attached."
        : json.coverImageError
          ? " Story text is ready — cover image could not be generated; upload a cover manually."
          : "";

      setStatus("success");
      setMessage(
        useChapters
          ? `Filled title, synopsis, author, age band, ${json.chapters.length} complete chapters, and story ID${mode === "create" ? ` (${json.storyId})` : ""}.${coverNote} Review everything, then save.`
          : `Filled the full story, synopsis, metadata, and story ID.${coverNote} Review, then save.`,
      );
    } catch {
      setStatus("error");
      setMessage("Network error while generating. Please try again.");
    }
  };

  return (
    <section className={styles.aiPanel} aria-labelledby="story-ai-heading">
      <div className={styles.aiPanelHead}>
        <Sparkles size={18} aria-hidden className={styles.aiPanelIcon} />
        <div>
          <h2 id="story-ai-heading" className={`font-fredoka ${styles.aiPanelTitle}`}>
            AI story assistant
          </h2>
          <p className={`font-nunito ${styles.aiPanelLead}`}>
            One prompt generates the complete package: title, synopsis, author, age band, cover
            thumbnail, story ID, and every chapter written in full.
          </p>
        </div>
      </div>

      <div className={styles.field}>
        <label className={`font-nunito ${styles.label}`} htmlFor="story-ai-prompt">
          Your prompt / instructions
        </label>
        <textarea
          id="story-ai-prompt"
          className={`font-nunito ${styles.textarea}`}
          style={{ minHeight: "7rem" }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: A 6-chapter mystery in Poetry Peak where Maya's rhymes go missing and the sisters follow paper-crane clues through whispering shelves…"
          disabled={status === "loading"}
        />
      </div>

      {useChapters ? (
        <div className={styles.field}>
          <label className={`font-nunito ${styles.label}`} htmlFor="story-ai-chapters">
            Number of chapters
          </label>
          <input
            id="story-ai-chapters"
            className={`font-nunito ${styles.input}`}
            type="number"
            min={1}
            max={LIBRARY_STORY_AI_MAX_CHAPTERS}
            value={chapterCount}
            onChange={(e) =>
              setChapterCount(
                Math.min(
                  LIBRARY_STORY_AI_MAX_CHAPTERS,
                  Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                ),
              )
            }
            disabled={status === "loading"}
          />
          <p className={`font-nunito ${styles.fieldHint}`}>
            Each chapter is generated in full (not an outline). Up to{" "}
            {LIBRARY_STORY_AI_MAX_CHAPTERS} chapters — more chapters take longer.
          </p>
        </div>
      ) : (
        <p className={`font-nunito ${styles.fieldHint}`}>
          Single-story mode: AI writes one long continuous story plus cover and metadata.
        </p>
      )}

      <div className={styles.aiPanelActions}>
        <button
          type="button"
          className={`font-nunito ${styles.aiGenerateBtn}`}
          onClick={() => void handleGenerate()}
          disabled={status === "loading"}
        >
          <Sparkles size={16} aria-hidden />
          {status === "loading" ? "Generating complete story…" : "Generate complete story"}
        </button>
      </div>

      {message ? (
        <p
          className={`font-nunito ${
            status === "error" ? styles.messageError : styles.messageSuccess
          }`}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}

export function coverBase64ToFile(
  base64: string,
  mimeType: string,
  storyId: string,
): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const ext = coverExtensionFromMime(mimeType);
  return new File([bytes], `${storyId}-cover.${ext}`, { type: mimeType });
}
