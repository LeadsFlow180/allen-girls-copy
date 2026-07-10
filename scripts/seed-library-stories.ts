/**
 * Seed built-in library catalog into Supabase (stories + cover thumbnails + PDFs).
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run migration 018_library_stories.sql first.
 *
 * Usage: npm run seed:library
 */
import { loadEnvConfig } from "@next/env";

import { seedLibraryStories } from "../src/lib/library/seed-library-catalog";

loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  console.log("Uploading library catalog to Supabase…");
  const result = await seedLibraryStories();

  for (const id of result.seeded) {
    console.log(`  ok ${id}`);
  }
  for (const skip of result.skipped) {
    console.warn(`  skip ${skip.id}: ${skip.reason}`);
  }
  for (const fail of result.failed) {
    console.error(`  fail ${fail.id}: ${fail.error}`);
  }

  console.log(
    `Done. ${result.seeded.length} uploaded, ${result.skipped.length} skipped, ${result.failed.length} failed.`,
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
