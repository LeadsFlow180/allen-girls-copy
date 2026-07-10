/**
 * POST /api/rewards/redeem — spend points to acquire a reward item.
 * Body: { itemId: string }
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { spendPoints } from "@/lib/rewards/points-engine";

const bodySchema = z.object({
  itemId: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  let json: unknown;
  try { json = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "server_error" }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "student") {
    return NextResponse.json({ error: "students_only" }, { status: 403 });
  }

  const { itemId } = parsed.data;

  // Check item exists + is purchasable
  const { data: item } = await supabase
    .from("reward_items")
    .select("price, purchasable")
    .eq("id", itemId)
    .maybeSingle();

  if (!item) return NextResponse.json({ error: "item_not_found" }, { status: 404 });
  if (!item.purchasable) return NextResponse.json({ error: "item_not_purchasable" }, { status: 400 });

  // Check not already owned
  const { data: existing } = await supabase
    .from("inventory")
    .select("item_id")
    .eq("student_user_id", user.id)
    .eq("item_id", itemId)
    .maybeSingle();

  if (existing) return NextResponse.json({ error: "already_owned" }, { status: 400 });

  // Spend points
  const spend = await spendPoints({
    supabase,
    studentId: user.id,
    amount: item.price as number,
    itemId,
  });

  if (!spend.ok) {
    return NextResponse.json({ error: spend.error }, { status: 402 });
  }

  // Add to inventory
  await supabase.from("inventory").insert({
    student_user_id: user.id,
    item_id: itemId,
  });

  return NextResponse.json({ success: true, newBalance: spend.newBalance, itemId });
}
