import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import { fetchAllTransactions } from "@/lib/queries";
import { movementsToCsv, type CsvMovement } from "@/lib/csv";
import type { Account, Category, Transaction } from "@/lib/types";

/** Downloads every movement as a CSV backup that can be imported back. */
export async function GET() {
  let accounts: Account[];
  let categories: Category[];
  let transactions: Transaction[];

  if (await isDemo()) {
    accounts = demoStore.getAccounts();
    categories = demoStore.getCategories();
    transactions = [...demoStore.getTransactions()].sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Response("No autenticado", { status: 401 });

    const [{ data: a }, { data: c }, t] = await Promise.all([
      supabase.from("accounts").select("*"),
      supabase.from("categories").select("*"),
      fetchAllTransactions(supabase, { ascending: true }),
    ]);
    accounts = (a ?? []) as Account[];
    categories = (c ?? []) as Category[];
    transactions = t;
  }

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const rows: CsvMovement[] = transactions.map((t) => {
    const account = accountMap.get(t.account_id);
    return {
      occurred_at: t.occurred_at,
      type: t.type,
      amount: Number(t.amount),
      currency: account?.currency ?? "ARS",
      account: account?.name ?? "",
      category: (t.category_id && categoryMap.get(t.category_id)?.name) || "",
      description: t.description ?? "",
    };
  });

  const today = new Date().toISOString().slice(0, 10);
  return new Response(movementsToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="piggy-bank-movimientos-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
