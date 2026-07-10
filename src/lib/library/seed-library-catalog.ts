import fs from "node:fs";
import path from "node:path";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { libraryNovelDefinitions } from "@/lib/library/library-catalog";
import { LIBRARY_STORAGE_BUCKET } from "@/lib/library/library-story-row";

export type SeedLibraryResult = {
  total: number;
  seeded: string[];
  skipped: { id: string; reason: string }[];
  failed: { id: string; error: string }[];
};

const COVERS_DIR = path.join(process.cwd(), "src/assets/images/library/covers");
const PDFS_DIR = path.join(process.cwd(), "public/library/pdfs");

function coverFileForId(storyId: string): string | null {
  const candidate = path.join(COVERS_DIR, `${storyId}-cover.png`);
  return fs.existsSync(candidate) ? candidate : null;
}

function pdfFileForPath(pdfPath: string): string | null {
  const fileName = path.basename(pdfPath);
  const candidate = path.join(PDFS_DIR, fileName);
  return fs.existsSync(candidate) ? candidate : null;
}

async function uploadFile(
  supabase: NonNullable<ReturnType<typeof createServiceRoleSupabaseClient>>,
  storagePath: string,
  filePath: string,
  contentType: string,
): Promise<string> {
  const body = fs.readFileSync(filePath);
  const { error } = await supabase.storage.from(LIBRARY_STORAGE_BUCKET).upload(storagePath, body, {
    upsert: true,
    contentType,
    cacheControl: "3600",
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(LIBRARY_STORAGE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/** Upload built-in catalog stories + cover thumbs + PDFs into shared Supabase tables. */
export async function seedLibraryStories(options?: {
  ids?: string[];
}): Promise<SeedLibraryResult> {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    throw new Error("supabase_not_configured");
  }

  const allDefinitions = libraryNovelDefinitions();
  const idFilter = options?.ids?.length ? new Set(options.ids) : null;
  const definitions = idFilter
    ? allDefinitions.filter((def) => idFilter.has(def.id))
    : allDefinitions;

  const result: SeedLibraryResult = {
    total: definitions.length,
    seeded: [],
    skipped: [],
    failed: [],
  };

  for (const def of definitions) {
    const coverFile = coverFileForId(def.id);
    if (!coverFile) {
      result.skipped.push({ id: def.id, reason: "cover_not_found" });
      continue;
    }

    try {
      const coverUrl = await uploadFile(supabase, `covers/${def.id}.png`, coverFile, "image/png");

      let pdfUrl: string | null = null;
      const pdfFile = pdfFileForPath(def.pdfPath);
      if (pdfFile) {
        pdfUrl = await uploadFile(supabase, `pdfs/${def.id}.pdf`, pdfFile, "application/pdf");
      }

      const { error } = await supabase.from("library_stories").upsert(
        {
          id: def.id,
          wing: def.wing,
          title: def.title,
          author: def.author,
          synopsis: def.synopsis,
          age_band: def.ageBand,
          format: def.format,
          tier: def.tier === "vip" ? "vip" : "standard",
          chapters: def.chapters,
          cover_url: coverUrl,
          pdf_url: pdfUrl,
          is_published: true,
          sort_order: 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) {
        result.failed.push({ id: def.id, error: error.message });
        continue;
      }

      result.seeded.push(def.id);
    } catch (err) {
      result.failed.push({
        id: def.id,
        error: err instanceof Error ? err.message : "unknown_error",
      });
    }
  }

  return result;
}
