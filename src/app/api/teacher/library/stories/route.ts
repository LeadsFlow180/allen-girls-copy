import { NextResponse } from "next/server";

import { isSuperAdminApiError, requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { fetchTeacherLibraryRows } from "@/lib/library/fetch-library-catalog";
import { libraryStoryRowToNovel } from "@/lib/library/library-catalog-merge";
import { insertLibraryStory } from "@/lib/library/library-story-db";
import {
  coverExtensionFromMime,
  libraryCoverStoragePath,
  libraryPdfStoragePath,
  uploadLibraryAsset,
} from "@/lib/library/library-storage";
import { parseLibraryStoryPayload } from "@/lib/library/library-story-validation";

export async function GET() {
  const auth = await requireSuperAdminApi();
  if (isSuperAdminApiError(auth)) return auth;

  const rows = await fetchTeacherLibraryRows();

  return NextResponse.json({
    stories: rows.map((row) => ({
      ...row,
      readMinutes: libraryStoryRowToNovel(row).readMinutes,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireSuperAdminApi();
  if (isSuperAdminApiError(auth)) return auth;

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const payloadRaw = form.get("payload");
    if (typeof payloadRaw !== "string") {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    let payloadJson: unknown;
    try {
      payloadJson = JSON.parse(payloadRaw) as unknown;
    } catch {
      return NextResponse.json({ error: "invalid_payload_json" }, { status: 400 });
    }

    const pdfFile = form.get("pdf");
    const hasPdfUpload = pdfFile instanceof File && pdfFile.size > 0;
    if (hasPdfUpload && payloadJson && typeof payloadJson === "object") {
      payloadJson = {
        ...(payloadJson as Record<string, unknown>),
        format: "pdf",
        contentSource: "pdf",
        useChapters: false,
        use_chapters: false,
        chapters: [],
        body: "",
      };
    }

    const parsed = parseLibraryStoryPayload(payloadJson);
    if (parsed.ok === false) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const coverFile = form.get("cover");
    if (!(coverFile instanceof File) || coverFile.size === 0) {
      return NextResponse.json({ error: "cover_required" }, { status: 400 });
    }

    const coverExt = coverExtensionFromMime(coverFile.type);
    if (!coverExt) {
      return NextResponse.json({ error: "invalid_cover_type" }, { status: 400 });
    }

    const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
    const coverUpload = await uploadLibraryAsset(
      libraryCoverStoragePath(parsed.data.id, coverExt),
      coverBuffer,
      coverFile.type,
    );
    if ("error" in coverUpload) {
      return NextResponse.json({ error: coverUpload.error }, { status: 500 });
    }

    let pdfUrl: string | null = null;
    if (hasPdfUpload) {
      if (pdfFile.type !== "application/pdf") {
        return NextResponse.json({ error: "invalid_pdf_type" }, { status: 400 });
      }
      const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
      const pdfUpload = await uploadLibraryAsset(
        libraryPdfStoragePath(parsed.data.id),
        pdfBuffer,
        "application/pdf",
      );
      if ("error" in pdfUpload) {
        return NextResponse.json({ error: pdfUpload.error }, { status: 500 });
      }
      pdfUrl = pdfUpload.publicUrl;
    }

    if (pdfUrl) {
      parsed.data.format = "pdf";
    } else if (parsed.data.format === "pdf") {
      return NextResponse.json({ error: "pdf_required" }, { status: 400 });
    }

    const { data, error } = await insertLibraryStory(auth.supabase, parsed.data, {
      cover_url: coverUpload.publicUrl,
      pdf_url: pdfUrl,
      created_by: auth.user.id,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ story: data }, { status: 201 });
  }

  const body = (await request.json()) as unknown;
  const parsed = parseLibraryStoryPayload(body);
  if (parsed.ok === false) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await insertLibraryStory(auth.supabase, parsed.data, {
    created_by: auth.user.id,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ story: data }, { status: 201 });
}
