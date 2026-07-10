/**
 * GET /api/rewards/store — return purchasable reward items + player inventory.
 */
import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getBalance } from "@/lib/rewards/points-engine";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
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

  const [balance, { data: items }, { data: inventory }] = await Promise.all([
    getBalance(supabase, user.id),
    supabase
      .from("reward_items")
      .select("id, label, description, category, tier, price")
      .eq("purchasable", true)
      .order("tier", { ascending: true })
      .order("price", { ascending: true }),
    supabase
      .from("inventory")
      .select("item_id")
      .eq("student_user_id", user.id),
  ]);

  const owned = new Set((inventory ?? []).map((r: { item_id: string }) => r.item_id));

  return NextResponse.json({
    balance,
    items: (items ?? []).map((item: {
      id: string; label: string; description: string;
      category: string; tier: number; price: number
    }) => ({
      ...item,
      owned: owned.has(item.id),
      canAfford: balance >= item.price && !owned.has(item.id),
    })),
  });
}
