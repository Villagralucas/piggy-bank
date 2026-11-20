import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction } from "@/lib/types";

const PAGE = 1000;

/**
 * Every transaction of the signed-in user. Supabase returns at most 1000 rows
 * per request, so this pages through them to keep balances right over time.
 */
export async function fetchAllTransactions(
  supabase: SupabaseClient,
  { ascending = false }: { ascending?: boolean } = {}
): Promise<Transaction[]> {
  const all: Transaction[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("occurred_at", { ascending })
      .order("created_at", { ascending })
      .range(from, from + PAGE - 1);
    if (error || !data) break;
    all.push(...(data as Transaction[]));
    if (data.length < PAGE) break;
  }
  return all;
}
