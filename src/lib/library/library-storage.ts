import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

import { LIBRARY_STORAGE_BUCKET } from "./library-story-row";

const BUCKET_MARKER = `/${LIBRARY_STORAGE_BUCKET}/`;

export function libraryStoragePathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const idx = url.indexOf(BUCKET_MARKER);
  if (idx === -1) return null;
  return url.slice(idx + BUCKET_MARKER.length);
}

export function libraryAssetPublicUrl(path: string): string | null {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) return null;
  const { data } = admin.storage.from(LIBRARY_STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadLibraryAsset(
  path: string,
  body: Buffer | ArrayBuffer,
  contentType: string,
): Promise<{ publicUrl: string } | { error: string }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) return { error: "supabase_not_configured" };

  const { error } = await admin.storage.from(LIBRARY_STORAGE_BUCKET).upload(path, body, {
    upsert: true,
    contentType,
    cacheControl: "3600",
  });

  if (error) return { error: error.message };

  const publicUrl = libraryAssetPublicUrl(path);
  if (!publicUrl) return { error: "public_url_failed" };
  return { publicUrl };
}

export async function deleteLibraryAssets(paths: string[]): Promise<void> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin || paths.length === 0) return;

  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) return;

  await admin.storage.from(LIBRARY_STORAGE_BUCKET).remove(unique);
}

export function libraryCoverStoragePath(storyId: string, ext: string): string {
  return `covers/${storyId}.${ext}`;
}

export function libraryPdfStoragePath(storyId: string): string {
  return `pdfs/${storyId}.pdf`;
}

export function coverExtensionFromMime(mime: string): string | null {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return null;
}
