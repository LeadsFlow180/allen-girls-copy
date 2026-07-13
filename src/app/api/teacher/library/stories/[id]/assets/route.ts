import { NextResponse } from "next/server";

import { isSuperAdminApiError, requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import {
  coverExtensionFromMime,
  deleteLibraryAssets,
  libraryCoverStoragePath,
  libraryPdfStoragePath,
  libraryStoragePathFromPublicUrl,
  uploadLibraryAsset,
} from "@/lib/library/library-storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireSuperAdminApi();
  if (isSuperAdminApiError(auth)) return auth;

  const { id } = await context.params;
  const form = await request.formData();
  const coverFile = form.get("cover");

  if (!(coverFile instanceof File) || coverFile.size === 0) {
    return NextResponse.json({ error: "cover_required" }, { status: 400 });
  }

  const coverExt = coverExtensionFromMime(coverFile.type);
  if (!coverExt) {
    return NextResponse.json({ error: "invalid_cover_type" }, { status: 400 });
  }

  const { data: existing } = await auth.supabase
    .from("library_stories")
    .select("cover_url")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
  const coverUpload = await uploadLibraryAsset(
    libraryCoverStoragePath(id, coverExt),
    coverBuffer,
    coverFile.type,
  );
  if ("error" in coverUpload) {
    return NextResponse.json({ error: coverUpload.error }, { status: 500 });
  }

  const oldPath = libraryStoragePathFromPublicUrl(existing.cover_url);
  if (oldPath) {
    await deleteLibraryAssets([oldPath]);
  }

  const { data, error } = await auth.supabase
    .from("library_stories")
    .update({
      cover_url: coverUpload.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ story: data });
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireSuperAdminApi();
  if (isSuperAdminApiError(auth)) return auth;

  const { id } = await context.params;
  const form = await request.formData();
  const pdfFile = form.get("pdf");

  if (!(pdfFile instanceof File) || pdfFile.size === 0) {
    return NextResponse.json({ error: "pdf_required" }, { status: 400 });
  }
  if (pdfFile.type !== "application/pdf") {
    return NextResponse.json({ error: "invalid_pdf_type" }, { status: 400 });
  }

  const { data: existing } = await auth.supabase
    .from("library_stories")
    .select("pdf_url")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
  const pdfUpload = await uploadLibraryAsset(
    libraryPdfStoragePath(id),
    pdfBuffer,
    "application/pdf",
  );
  if ("error" in pdfUpload) {
    return NextResponse.json({ error: pdfUpload.error }, { status: 500 });
  }

  const oldPath = libraryStoragePathFromPublicUrl(existing.pdf_url);
  if (oldPath) {
    await deleteLibraryAssets([oldPath]);
  }

  const { data, error } = await auth.supabase
    .from("library_stories")
    .update({
      pdf_url: pdfUpload.publicUrl,
      format: "pdf",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ story: data });
}
