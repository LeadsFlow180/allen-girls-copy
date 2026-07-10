import { NextResponse } from "next/server";
import { fetchPublishedLibraryNovels } from "@/lib/library/fetch-library-catalog";

export async function GET() {
  const novels = await fetchPublishedLibraryNovels();

  return NextResponse.json({
    novels: novels.map((novel) => ({
      id: novel.id,
      wing: novel.wing,
      title: novel.title,
      author: novel.author,
      synopsis: novel.synopsis,
      ageBand: novel.ageBand,
      readMinutes: novel.readMinutes,
      format: novel.format,
      pdfPath: novel.pdfPath,
      tier: novel.tier ?? "standard",
      coverUrl: novel.coverUrl ?? null,
      spreads: novel.spreads,
    })),
  });
}
