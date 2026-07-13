"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { LibraryCoverImage, resolveLibraryCoverSrc } from "@/components/library/library-cover-image";
import { LIBRARY_NOVEL_COVERS } from "@/lib/library/library-art";
import { slugifyStoryIdFromTitle } from "@/lib/library/library-story-validation";
import { decodeLibraryStoryContent } from "@/lib/library/library-story-storage";
import type { LibraryStoryRow } from "@/lib/library/library-story-row";

import { TeacherStoryAiPanel, coverBase64ToFile, type TeacherStoryAiResult } from "./teacher-story-ai-panel";
import styles from "./teacher-library.module.css";

function formatStorySaveError(code?: string): string {
  switch (code) {
    case "chapters_required":
      return "Add at least one chapter, or uncheck “Use chapters” and paste the full story in Story content.";
    case "body_required":
      return "Story text is required in “Write chapters” mode. Switch to “Upload PDF” if you have a PDF file instead.";
    case "cover_required":
      return "Cover thumbnail is required for new stories.";
    case "pdf_required":
      return "Upload a PDF file for this story.";
    default:
      return code ?? "Could not save story.";
  }
}

type Props = {
  mode: "create" | "edit";
  initial?: LibraryStoryRow | null;
  basePath?: string;
};

type ContentSource = "manual" | "pdf";

function inferContentSource(
  initial: LibraryStoryRow | null | undefined,
  initialContent: ReturnType<typeof decodeLibraryStoryContent> | null,
): ContentSource {
  if (!initial) return "manual";
  if (initial.format === "pdf") return "pdf";
  const hasText =
    Boolean(initialContent?.body?.trim()) ||
    Boolean(initialContent?.chapters?.some((chapter) => chapter.trim()));
  if (initial.pdf_url?.trim() && !hasText) return "pdf";
  return "manual";
}

export function TeacherLibraryStoryForm({
  mode,
  initial,
  basePath = "/admin/library",
}: Props) {
  const initialContent = initial ? decodeLibraryStoryContent(initial) : null;

  const [contentSource, setContentSource] = useState<ContentSource>(() =>
    inferContentSource(initial, initialContent),
  );
  const [id, setId] = useState(initial?.id ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [wing, setWing] = useState<"allen_girls" | "licensed">(initial?.wing ?? "allen_girls");
  const [author, setAuthor] = useState(initial?.author ?? "Allen Girls Adventures");
  const [synopsis, setSynopsis] = useState(initial?.synopsis ?? "");
  const [ageBand, setAgeBand] = useState(initial?.age_band ?? "Ages 8–11");
  const [tier, setTier] = useState<"standard" | "vip">(initial?.tier ?? "standard");
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [useChapters, setUseChapters] = useState(initialContent?.useChapters ?? true);
  const [chapters, setChapters] = useState<string[]>(
    initialContent?.useChapters === false
      ? [""]
      : initialContent?.chapters?.length
        ? initialContent.chapters
        : [""],
  );
  const [body, setBody] = useState(
    initialContent?.useChapters === false ? (initialContent.body ?? "") : "",
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const suggestedId = useMemo(() => slugifyStoryIdFromTitle(title) ?? "", [title]);

  const existingCover = useMemo(() => {
    if (!initial?.id) return null;
    return resolveLibraryCoverSrc(initial.id, initial.cover_url, LIBRARY_NOVEL_COVERS);
  }, [initial?.id, initial?.cover_url]);

  const hasPdfEdition = Boolean(pdfFile || initial?.pdf_url);
  const isPdfSource = contentSource === "pdf";

  const onPdfPick = (file: File | null) => {
    setPdfFile(file);
    if (file) setContentSource("pdf");
  };

  const onCoverPick = (file: File | null) => {
    setCoverFile(file);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  const updateChapter = (index: number, value: string) => {
    setChapters((prev) => prev.map((chapter, i) => (i === index ? value : chapter)));
  };

  const addChapter = () => setChapters((prev) => [...prev, ""]);
  const removeChapter = (index: number) => {
    setChapters((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const applyAiGeneratedStory = (result: TeacherStoryAiResult) => {
    if (result.title.trim()) setTitle(result.title.trim());
    if (mode === "create" && result.storyId.trim()) setId(result.storyId.trim());
    if (result.author.trim()) setAuthor(result.author.trim());
    if (result.synopsis.trim()) setSynopsis(result.synopsis.trim());
    if (result.ageBand.trim()) setAgeBand(result.ageBand.trim());
    if (result.tier) setTier(result.tier);

    setContentSource("manual");

    if (result.useChapters && result.chapters.length > 0) {
      setUseChapters(true);
      setChapters(result.chapters);
      setBody("");
    } else if (result.body.trim()) {
      setUseChapters(false);
      setBody(result.body.trim());
      setChapters([""]);
    }

    if (result.coverImage) {
      const storyId = (mode === "create" ? result.storyId : initial?.id) ?? result.storyId;
      const cover = coverBase64ToFile(
        result.coverImage.base64,
        result.coverImage.mimeType,
        storyId || "story-cover",
      );
      onCoverPick(cover);
    }
  };

  const handleUseChaptersChange = (enabled: boolean) => {
    if (enabled === useChapters) return;

    if (enabled) {
      const merged = body.trim() || chapters.map((c) => c.trim()).filter(Boolean).join("\n\n");
      setChapters(merged ? [merged] : [""]);
      setBody("");
    } else {
      const merged = chapters.map((c) => c.trim()).filter(Boolean).join("\n\n");
      setBody(merged || body);
      setChapters([""]);
    }

    setUseChapters(enabled);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const storyId = (mode === "create" ? id.trim() || suggestedId : initial?.id ?? "").trim();
    const trimmedChapters = chapters.map((c) => c.trim()).filter(Boolean);
    const trimmedBody = body.trim();
    const singleStory = !useChapters;
    const uploadingPdf = Boolean(pdfFile);
    const payload = {
      id: storyId,
      wing,
      title: title.trim(),
      author: author.trim(),
      synopsis: synopsis.trim(),
      ageBand,
      tier,
      format: isPdfSource ? "pdf" : "text",
      contentSource: isPdfSource ? "pdf" : "manual",
      useChapters: isPdfSource ? false : !singleStory,
      use_chapters: isPdfSource ? false : !singleStory,
      chapters: isPdfSource ? [] : singleStory ? [] : trimmedChapters,
      body: isPdfSource ? "" : singleStory ? trimmedBody : "",
      isPublished,
    };

    if (!payload.id || !payload.title) {
      setStatus("error");
      setMessage("Story id and title are required.");
      return;
    }

    if (isPdfSource) {
      if (mode === "create" && !uploadingPdf) {
        setStatus("error");
        setMessage("Upload a PDF file — no need to type chapters when using PDF mode.");
        return;
      }
      if (mode === "edit" && !uploadingPdf && !hasPdfEdition) {
        setStatus("error");
        setMessage("Upload a PDF file for this story.");
        return;
      }
    } else if (!singleStory && payload.chapters.length === 0) {
      setStatus("error");
      setMessage("Add at least one chapter, or switch to “Upload PDF” if you have a ready-made book file.");
      return;
    } else if (singleStory && !trimmedBody) {
      setStatus("error");
      setMessage("Story content is required. Paste the full story, or switch to “Upload PDF”.");
      return;
    }

    try {
      if (mode === "create") {
        if (!coverFile) {
          setStatus("error");
          setMessage("Cover thumbnail is required for new stories.");
          return;
        }

        const form = new FormData();
        form.append("payload", JSON.stringify(payload));
        form.append("cover", coverFile);
        if (isPdfSource && pdfFile) form.append("pdf", pdfFile);

        const res = await fetch("/api/teacher/library/stories", { method: "POST", body: form });
        const json = (await res.json()) as { error?: string };
        if (!res.ok) {
          setStatus("error");
          setMessage(formatStorySaveError(json.error));
          return;
        }
        setStatus("success");
        setMessage("Story published to the library!");
        window.location.href = basePath;
        return;
      }

      const res = await fetch(`/api/teacher/library/stories/${encodeURIComponent(initial!.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(formatStorySaveError(json.error));
        return;
      }

      if (coverFile) {
        const coverForm = new FormData();
        coverForm.append("cover", coverFile);
        const coverRes = await fetch(
          `/api/teacher/library/stories/${encodeURIComponent(initial!.id)}/assets`,
          { method: "POST", body: coverForm },
        );
        if (!coverRes.ok) {
          const coverJson = (await coverRes.json()) as { error?: string };
          setStatus("error");
          setMessage(coverJson.error ?? "Story saved but cover upload failed.");
          return;
        }
      }

      if (isPdfSource && pdfFile) {
        const pdfForm = new FormData();
        pdfForm.append("pdf", pdfFile);
        const pdfRes = await fetch(
          `/api/teacher/library/stories/${encodeURIComponent(initial!.id)}/assets`,
          { method: "PUT", body: pdfForm },
        );
        if (!pdfRes.ok) {
          const pdfJson = (await pdfRes.json()) as { error?: string };
          setStatus("error");
          setMessage(formatStorySaveError(pdfJson.error) ?? "Story saved but PDF upload failed.");
          return;
        }
      }

      setStatus("success");
      setMessage("Story updated.");
      window.location.href = basePath;
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      {mode === "create" ? (
        <div className={styles.field}>
          <label className={`font-nunito ${styles.label}`}>Story ID (slug)</label>
          <input
            className={`font-nunito ${styles.input}`}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder={suggestedId || "ag-my-new-story"}
          />
          {suggestedId ? (
            <p className="font-nunito" style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
              Suggested: {suggestedId}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={styles.field}>
        <label className={`font-nunito ${styles.label}`}>Title</label>
        <input className={`font-nunito ${styles.input}`} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className={`${styles.row2} ${styles.field}`}>
        <div>
          <label className={`font-nunito ${styles.label}`}>Wing</label>
          <select className={`font-nunito ${styles.select}`} value={wing} onChange={(e) => setWing(e.target.value as typeof wing)}>
            <option value="allen_girls">Allen Girls</option>
            <option value="licensed">Licensed</option>
          </select>
        </div>
        <div>
          <label className={`font-nunito ${styles.label}`}>Tier</label>
          <select className={`font-nunito ${styles.select}`} value={tier} onChange={(e) => setTier(e.target.value as typeof tier)}>
            <option value="standard">Standard</option>
            <option value="vip">VIP</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={`font-nunito ${styles.label}`}>Author</label>
        <input className={`font-nunito ${styles.input}`} value={author} onChange={(e) => setAuthor(e.target.value)} />
      </div>

      <div className={styles.field}>
        <label className={`font-nunito ${styles.label}`}>Synopsis</label>
        <textarea className={`font-nunito ${styles.textarea}`} style={{ minHeight: "4.5rem" }} value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
      </div>

      <div className={styles.field}>
        <label className={`font-nunito ${styles.label}`}>Age band</label>
        <input className={`font-nunito ${styles.input}`} value={ageBand} onChange={(e) => setAgeBand(e.target.value)} />
      </div>

      <div className={styles.field}>
        <label className={`font-nunito ${styles.label}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Published (visible in Library Labyrinth)
        </label>
      </div>

      <div className={styles.field}>
        <span className={`font-nunito ${styles.label}`}>How do you want to add this story?</span>
        <div className={styles.contentSourceRow} role="radiogroup" aria-label="Story content source">
          <button
            type="button"
            role="radio"
            aria-checked={contentSource === "manual"}
            className={`${styles.contentSourceBtn}${contentSource === "manual" ? ` ${styles.contentSourceBtnActive}` : ""}`}
            onClick={() => setContentSource("manual")}
          >
            <span className={styles.contentSourceTitle}>Write chapters</span>
            <span className={styles.contentSourceHint}>Type story text or chapters in the form</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={contentSource === "pdf"}
            className={`${styles.contentSourceBtn}${contentSource === "pdf" ? ` ${styles.contentSourceBtnActive}` : ""}`}
            onClick={() => setContentSource("pdf")}
          >
            <span className={styles.contentSourceTitle}>Upload PDF</span>
            <span className={styles.contentSourceHint}>Skip typing — upload a PDF flip book instead</span>
          </button>
        </div>
      </div>

      {isPdfSource ? (
        <div className={styles.field}>
          <label className={`font-nunito ${styles.label}`}>
            Story PDF {mode === "create" ? "(required)" : "(replace file)"}
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => onPdfPick(e.target.files?.[0] ?? null)}
            required={mode === "create"}
          />
          <p className={`font-nunito ${styles.fieldHint}`}>
            No chapters or story text needed. Kids will read this as flippable pages in the Library Labyrinth.
          </p>
          {initial?.pdf_url && !pdfFile ? (
            <p className={`font-nunito ${styles.fieldHint}`}>
              Current PDF:{" "}
              <a href={initial.pdf_url} target="_blank" rel="noopener noreferrer">
                {initial.id}.pdf
              </a>
            </p>
          ) : null}
          {pdfFile ? (
            <p className={`font-nunito ${styles.fieldHint}`}>Ready to upload: {pdfFile.name}</p>
          ) : null}
        </div>
      ) : (
        <>
      <TeacherStoryAiPanel
        mode={mode}
        title={title}
        synopsis={synopsis}
        ageBand={ageBand}
        wing={wing}
        useChapters={useChapters}
        onGenerated={applyAiGeneratedStory}
      />

      <div className={styles.field}>
        <div className={styles.chapterHead}>
          <span className={`font-nunito ${styles.label}`}>Story structure</span>
          <label className={`font-nunito ${styles.toggleRow}`}>
            <input
              type="checkbox"
              checked={useChapters}
              onChange={(e) => handleUseChaptersChange(e.target.checked)}
            />
            <span>Use chapters</span>
            {!useChapters ? <span className={styles.modeBadge}>Single story</span> : null}
          </label>
        </div>
        <p className={`font-nunito ${styles.fieldHint}`}>
          {useChapters
            ? "Split the story into chapters with optional titles (Chapter 1 — Title on the first line)."
            : "One continuous story — no chapter headings in the Library reader."}
        </p>
      </div>

      {useChapters ? (
        <div className={styles.field}>
          <div className={styles.chapterHead}>
            <span className={`font-nunito ${styles.label}`}>Chapters</span>
            <button type="button" className={`font-nunito ${styles.linkBtn}`} onClick={addChapter}>
              + Add chapter
            </button>
          </div>
          {chapters.map((chapter, index) => (
            <div key={index} className={styles.chapterBlock}>
              <div className={styles.chapterHead}>
                <span className={`font-nunito ${styles.chapterLabel}`}>Chapter {index + 1}</span>
                {chapters.length > 1 ? (
                  <button type="button" className={`font-nunito ${styles.removeBtn}`} onClick={() => removeChapter(index)}>
                    Remove
                  </button>
                ) : null}
              </div>
              <textarea
                className={`font-nunito ${styles.textarea}`}
                value={chapter}
                onChange={(e) => updateChapter(index, e.target.value)}
                placeholder="Chapter prose…"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.field}>
          <label className={`font-nunito ${styles.label}`}>Story content</label>
          <textarea
            className={`font-nunito ${styles.textarea}`}
            style={{ minHeight: "12rem" }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Full story prose…"
          />
        </div>
      )}
        </>
      )}

      <div className={styles.field}>
        <label className={`font-nunito ${styles.label}`}>
          Cover thumbnail {mode === "create" ? "(required)" : "(optional — replaces current)"}
        </label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => onCoverPick(e.target.files?.[0] ?? null)}
        />
        {coverPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPreview} alt="New cover preview" className={styles.previewCover} />
        ) : existingCover ? (
          <LibraryCoverImage src={existingCover} alt="Current cover" className={styles.previewCover} />
        ) : null}
      </div>

      {message ? (
        <p className={`font-nunito ${status === "error" ? styles.messageError : styles.messageSuccess}`}>
          {message}
        </p>
      ) : null}

      <div className={styles.formActions}>
        <button type="submit" disabled={status === "loading"} className={`font-fredoka ${styles.submitBtn}`}>
          {status === "loading" ? "Saving…" : mode === "create" ? "Create story" : "Save changes"}
        </button>
        <Link href={basePath} className={`font-nunito ${styles.backLink}`}>
          Back to library
        </Link>
      </div>
    </form>
  );
}
