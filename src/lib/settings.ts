import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";

/** Monthly spending budget for the current user, or null if not set (or the table doesn't exist yet). */
export async function getMonthlyBudget(): Promise<number | null> {
  if (await isDemo()) return demoStore.getMonthlyBudget();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("monthly_budget")
    .maybeSingle();

  if (error || !data || data.monthly_budget === null) return null;
  return Number(data.monthly_budget);
}
