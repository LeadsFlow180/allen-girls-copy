import { z } from "zod";

import { generateGeminiCoverImage, generateGeminiJson } from "@/lib/ai/gemini";
import { slugifyStoryIdFromTitle } from "@/lib/library/library-story-validation";

export const LIBRARY_STORY_AI_MAX_CHAPTERS = 12;

export const libraryStoryAiRequestSchema = z.object({
  prompt: z.string().trim().min(12).max(6000),
  chapterCount: z.number().int().min(1).max(LIBRARY_STORY_AI_MAX_CHAPTERS),
  singleStory: z.boolean().optional().default(false),
  title: z.string().trim().max(200).optional(),
  synopsis: z.string().trim().max(2000).optional(),
  ageBand: z.string().trim().max(80).optional(),
  wing: z.enum(["allen_girls", "licensed"]).optional().default("allen_girls"),
  tier: z.enum(["standard", "vip"]).optional(),
});

export type LibraryStoryAiRequest = z.infer<typeof libraryStoryAiRequestSchema>;

const chapterOutlineSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1),
  summary: z.string().min(20),
});

const storyPlanSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  synopsis: z.string().min(1),
  ageBand: z.string().min(1),
  tier: z.enum(["standard", "vip"]),
  coverImagePrompt: z.string().min(20),
  chapterOutlines: z.array(chapterOutlineSchema).optional(),
});

const chapterContentSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1),
  content: z.string().min(200),
});

const singleBodySchema = z.object({
  body: z.string().min(400),
});

export type GeneratedLibraryStory = {
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
  model: string;
  chapterCount: number;
};

const PLAN_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    author: { type: "string" },
    synopsis: { type: "string" },
    ageBand: { type: "string" },
    tier: { type: "string", enum: ["standard", "vip"] },
    coverImagePrompt: { type: "string" },
    chapterOutlines: {
      type: "array",
      items: {
        type: "object",
        properties: {
          number: { type: "integer" },
          title: { type: "string" },
          summary: { type: "string" },
        },
        required: ["number", "title", "summary"],
      },
    },
  },
  required: ["title", "author", "synopsis", "ageBand", "tier", "coverImagePrompt"],
} as const;

const CHAPTER_JSON_SCHEMA = {
  type: "object",
  properties: {
    number: { type: "integer" },
    title: { type: "string" },
    content: { type: "string" },
  },
  required: ["number", "title", "content"],
} as const;

const BODY_JSON_SCHEMA = {
  type: "object",
  properties: { body: { type: "string" } },
  required: ["body"],
} as const;

export function buildLibraryStoryAiSystemPrompt(wing: "allen_girls" | "licensed"): string {
  const castRule =
    wing === "allen_girls"
      ? "Feature Natalia, Maya, and Alana (the Allen sisters) and SPARK, their friendly robot guide, when it fits the plot."
      : "Write in a licensed classic adventure tone suitable for the Library Labyrinth.";

  return [
    "You are a professional children's fiction author for Allen Girls Adventures.",
    "Setting: a magical library labyrinth with books, doors, wings, and gentle mystery.",
    castRule,
    "Tone: warm, vivid, age-appropriate. No violence, romance, gore, or frightening horror.",
    "Never use real child names, schools, or identifying details.",
    "Return ONLY valid JSON matching the schema.",
  ].join(" ");
}

function buildPlanUserPrompt(input: LibraryStoryAiRequest): string {
  const lines = [
    "Create a complete story plan from the teacher's instructions.",
    "",
    `Teacher instructions:\n${input.prompt}`,
    "",
    input.title ? `Preferred title (use or improve): ${input.title}` : "Invent a catchy, unique title.",
    input.synopsis ? `Draft synopsis to refine: ${input.synopsis}` : "",
    input.ageBand ? `Age band: ${input.ageBand}` : "Default age band: Ages 8–11",
    input.tier ? `Tier hint: ${input.tier}` : "Pick standard or vip based on how special the adventure feels.",
    "",
    "Fill ALL metadata fields: title, author, synopsis, ageBand, tier.",
    "Author should be 'Allen Girls Adventures' unless the teacher clearly wants a different byline.",
    "coverImagePrompt: detailed children's book cover art brief (no text in the image), landscape 3:2, colorful, magical library style.",
  ];

  if (!input.singleStory) {
    lines.push(
      "",
      `Provide exactly ${input.chapterCount} chapterOutlines.`,
      "Each outline needs number, title, and a 2-3 sentence summary of what happens.",
      "The full arc must have a clear beginning, rising action, and satisfying ending.",
    );
  }

  return lines.filter(Boolean).join("\n");
}

function buildChapterUserPrompt(
  input: LibraryStoryAiRequest,
  plan: z.infer<typeof storyPlanSchema>,
  outline: z.infer<typeof chapterOutlineSchema>,
  previousChapters: string[],
): string {
  const wordsTarget = input.chapterCount <= 4 ? 650 : input.chapterCount <= 8 ? 520 : 420;

  return [
    `Write Chapter ${outline.number} of "${plan.title}" in full.`,
    "",
    `Story synopsis: ${plan.synopsis}`,
    `This chapter title: ${outline.title}`,
    `This chapter plot beats: ${outline.summary}`,
    "",
    previousChapters.length
      ? `Previous chapters already written (for continuity only):\n${previousChapters.map((c, i) => `--- Chapter ${i + 1} excerpt ---\n${c.slice(0, 900)}`).join("\n\n")}`
      : "This is Chapter 1 — open the adventure strongly.",
    "",
    `Write at least ${wordsTarget} words of complete prose in the content field.`,
    "content must be ONLY the chapter body paragraphs (no heading line).",
    "Use engaging dialogue and sensory detail. Finish this chapter's scene properly.",
    `Return JSON: { "number": ${outline.number}, "title": "${outline.title}", "content": "..." }`,
  ].join("\n");
}

function buildSingleStoryUserPrompt(
  input: LibraryStoryAiRequest,
  plan: z.infer<typeof storyPlanSchema>,
): string {
  return [
    `Write the complete story "${plan.title}" as one piece.`,
    "",
    `Synopsis: ${plan.synopsis}`,
    `Teacher instructions: ${input.prompt}`,
    "",
    "Write at least 1800 words in the body field.",
    "Include a clear beginning, middle, and end. Use paragraph breaks.",
    "Return JSON: { \"body\": \"...\" }",
  ].join("\n");
}

export function formatAiChapterForLibrary(
  chapter: z.infer<typeof chapterContentSchema>,
): string {
  const heading = `Chapter ${chapter.number} — ${chapter.title.trim()}`;
  const body = chapter.content.trim();
  if (body.startsWith("Chapter ")) return body;
  return `${heading}\n\n${body}`;
}

function buildCoverArtPrompt(plan: z.infer<typeof storyPlanSchema>): string {
  return [
    "Children's book cover illustration, landscape 3:2, professional quality.",
    "No text, no letters, no watermarks on the image.",
    plan.coverImagePrompt,
    `Mood inspired by the story: ${plan.title}.`,
    "Magical library labyrinth aesthetic, rich colors, appealing to ages 8-11.",
  ].join(" ");
}

export async function generateCompleteLibraryStory(
  input: LibraryStoryAiRequest,
): Promise<GeneratedLibraryStory> {
  const system = buildLibraryStoryAiSystemPrompt(input.wing);

  const { data: planRaw, model } = await generateGeminiJson<unknown>({
    system,
    userText: buildPlanUserPrompt(input),
    jsonSchema: PLAN_JSON_SCHEMA,
    maxOutputTokens: 4096,
    temperature: 0.82,
  });

  const plan = storyPlanSchema.parse(planRaw);
  const title = input.title?.trim() || plan.title.trim();
  const storyId = slugifyStoryIdFromTitle(title) ?? `ag-story-${Date.now()}`;

  let chapters: string[] = [];
  let body = "";

  if (input.singleStory) {
    const { data: bodyRaw } = await generateGeminiJson<unknown>({
      system,
      userText: buildSingleStoryUserPrompt(input, plan),
      jsonSchema: BODY_JSON_SCHEMA,
      maxOutputTokens: 16384,
      temperature: 0.88,
    });
    body = singleBodySchema.parse(bodyRaw).body.trim();
  } else {
    const outlines = (plan.chapterOutlines ?? [])
      .sort((a, b) => a.number - b.number)
      .slice(0, input.chapterCount);

    if (outlines.length < input.chapterCount) {
      throw new Error(
        `Story plan only included ${outlines.length} chapter outlines; expected ${input.chapterCount}.`,
      );
    }

    const written: string[] = [];
    for (const outline of outlines) {
      const { data: chapterRaw } = await generateGeminiJson<unknown>({
        system,
        userText: buildChapterUserPrompt(input, plan, outline, written),
        jsonSchema: CHAPTER_JSON_SCHEMA,
        maxOutputTokens: 8192,
        temperature: 0.9,
      });
      const chapter = chapterContentSchema.parse(chapterRaw);
      const formatted = formatAiChapterForLibrary(chapter);
      written.push(formatted);
    }
    chapters = written;
  }

  let coverImage: GeneratedLibraryStory["coverImage"] = null;
  let coverImageError: string | null = null;
  try {
    coverImage = await generateGeminiCoverImage(buildCoverArtPrompt(plan));
  } catch (err) {
    coverImageError = err instanceof Error ? err.message : "cover_generation_failed";
    console.error("[library-story-ai] cover:", coverImageError);
  }

  return {
    title,
    storyId,
    author: plan.author.trim() || "Allen Girls Adventures",
    synopsis: input.synopsis?.trim() || plan.synopsis.trim(),
    ageBand: input.ageBand?.trim() || plan.ageBand.trim() || "Ages 8–11",
    tier: input.tier ?? plan.tier,
    useChapters: !input.singleStory,
    chapters,
    body,
    coverImage,
    coverImageError,
    model,
    chapterCount: chapters.length,
  };
}
