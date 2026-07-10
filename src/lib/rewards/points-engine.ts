/**
 * Points engine — Phase 5.
 * All award/spend operations go through here (server-side only).
 * Never call from Client Components.
 */
import type { SupabaseClient } from "@supabase/ssr";

// ── Point values from architecture doc ───────────────────────────────────
export const POINT_VALUES = {
  easy_puzzle:          13,
  medium_challenge:     19,
  hard_challenge:       25,
  first_time_bonus:     6,
  daily_login:          5,
  streak_milestone:     13,
  clean_run_bonus:      3,
} as const;

export type PointEventType =
  | "gate_pass_crisis"
  | "gate_pass_discovery"
  | "first_time_bonus"
  | "daily_login"
  | "streak_milestone"
  | "clean_run_bonus"
  | "placement_complete"
  | "redeem";

type AwardOpts = {
  supabase: SupabaseClient;
  studentId: string;
  amount: number;
  eventType: PointEventType;
  referenceId?: string;
};

type SpendOpts = {
  supabase: SupabaseClient;
  studentId: string;
  amount: number;
  itemId: string;
};

/** Ensure wallet row exists, then return current balance. */
async function ensureWallet(supabase: SupabaseClient, studentId: string): Promise<number> {
  const { data } = await supabase
    .from("points_wallet")
    .select("balance")
    .eq("student_user_id", studentId)
    .maybeSingle();

  if (data) return data.balance as number;

  await supabase
    .from("points_wallet")
    .insert({ student_user_id: studentId, balance: 0, lifetime_earned: 0 });
  return 0;
}

/** Award points — upserts wallet + inserts transaction. */
export async function awardPoints(opts: AwardOpts): Promise<{ newBalance: number }> {
  const { supabase, studentId, amount, eventType, referenceId } = opts;
  if (amount <= 0) return { newBalance: await ensureWallet(supabase, studentId) };

  await ensureWallet(supabase, studentId);

  const { data: wallet } = await supabase
    .from("points_wallet")
    .select("balance, lifetime_earned")
    .eq("student_user_id", studentId)
    .single();

  const current = (wallet?.balance as number) ?? 0;
  const lifetime = (wallet?.lifetime_earned as number) ?? 0;
  const newBalance = current + amount;

  await supabase
    .from("points_wallet")
    .update({
      balance: newBalance,
      lifetime_earned: lifetime + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("student_user_id", studentId);

  await supabase.from("point_transactions").insert({
    student_user_id: studentId,
    amount,
    event_type: eventType,
    reference_id: referenceId ?? null,
  });

  return { newBalance };
}

/** Spend points (redeem item) — fails if balance insufficient. */
export async function spendPoints(opts: SpendOpts): Promise<
  { ok: true; newBalance: number } | { ok: false; error: string }
> {
  const { supabase, studentId, amount, itemId } = opts;

  const current = await ensureWallet(supabase, studentId);
  if (current < amount) {
    return { ok: false, error: "insufficient_balance" };
  }

  const newBalance = current - amount;

  await supabase
    .from("points_wallet")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("student_user_id", studentId);

  await supabase.from("point_transactions").insert({
    student_user_id: studentId,
    amount: -amount,
    event_type: "redeem" as PointEventType,
    reference_id: itemId,
  });

  return { ok: true, newBalance };
}

/** Fetch current balance (0 if wallet not yet created). */
export async function getBalance(supabase: SupabaseClient, studentId: string): Promise<number> {
  const { data } = await supabase
    .from("points_wallet")
    .select("balance")
    .eq("student_user_id", studentId)
    .maybeSingle();
  return (data?.balance as number) ?? 0;
}
