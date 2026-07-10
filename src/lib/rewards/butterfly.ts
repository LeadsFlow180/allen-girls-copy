/**
 * Butterfly sanctuary helpers — Phase 5.
 * One species per domain+tier milestone. Server-side only.
 */
import type { SupabaseClient } from "@supabase/ssr";

export type ButterflySpecies = {
  key: string;
  label: string;
  emoji: string;
  domain: string;
  tier: string;
};

const SPECIES_MAP: Record<string, ButterflySpecies> = {
  ela_emerging:   { key: "ela_emerging",   label: "Copper Reader",        emoji: "🦋", domain: "ela",  tier: "emerging" },
  ela_on_track:   { key: "ela_on_track",   label: "Blue Morpho Reader",   emoji: "🦋", domain: "ela",  tier: "on_track" },
  ela_stretch:    { key: "ela_stretch",    label: "Golden Language Wing",  emoji: "🦋", domain: "ela",  tier: "stretch"  },
  math_emerging:  { key: "math_emerging",  label: "Amber Number Wing",    emoji: "🦋", domain: "math", tier: "emerging" },
  math_on_track:  { key: "math_on_track",  label: "Emerald Equation Wing",emoji: "🦋", domain: "math", tier: "on_track" },
  math_stretch:   { key: "math_stretch",   label: "Prismatic Solver Wing",emoji: "🦋", domain: "math", tier: "stretch"  },
};

export function getSpeciesForDomainTier(domain: string, tier: string): ButterflySpecies | null {
  return SPECIES_MAP[`${domain}_${tier}`] ?? null;
}

export function allSpecies(): ButterflySpecies[] {
  return Object.values(SPECIES_MAP);
}

/** Award butterfly if not already earned. Returns true if newly earned. */
export async function awardButterfly(
  supabase: SupabaseClient,
  studentId: string,
  domain: string,
  tier: string,
): Promise<{ awarded: boolean; species: ButterflySpecies | null }> {
  const species = getSpeciesForDomainTier(domain, tier);
  if (!species) return { awarded: false, species: null };

  const { data: existing } = await supabase
    .from("butterfly_sanctuary")
    .select("species_key")
    .eq("student_user_id", studentId)
    .eq("species_key", species.key)
    .maybeSingle();

  if (existing) return { awarded: false, species };

  const { error } = await supabase.from("butterfly_sanctuary").insert({
    student_user_id: studentId,
    species_key: species.key,
    label: species.label,
  });

  if (error) {
    console.error("[butterfly] insert error", error);
    return { awarded: false, species };
  }

  return { awarded: true, species };
}

/** Fetch all earned butterflies for a student. */
export async function getSanctuaryState(
  supabase: SupabaseClient,
  studentId: string,
): Promise<{ species_key: string; label: string; earned_at: string }[]> {
  const { data } = await supabase
    .from("butterfly_sanctuary")
    .select("species_key, label, earned_at")
    .eq("student_user_id", studentId)
    .order("earned_at", { ascending: true });
  return data ?? [];
}
