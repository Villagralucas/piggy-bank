"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import type { Category, Transaction, TransactionType } from "@/lib/types";
import { budgetAlertMessage, categoryBudgetStatus } from "@/lib/budget-alerts";
import { argentinaNow, monthKey } from "@/lib/recurring";

/**
 * After saving an expense, a warning if its category is now at 80% or more
 * of its monthly budget (only when this movement is the one that crossed it).
 */
function crossedBudgetWarning(category: Category | undefined, monthTx: Transaction[], amount: number) {
  if (!category) return null;
  const [status] = categoryBudgetStatus([category], monthTx);
  if (!status) return null;
  const before = (status.spent - amount) / status.budget;
  const crossed80 = before < 0.8 && status.ratio >= 0.8;
  const crossed100 = before < 1 && status.ratio >= 1;
  return crossed80 || crossed100 ? budgetAlertMessage(status) : null;
}

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/reports");
}

export async function createTransaction(formData: FormData) {
  const account_id = String(formData.get("account_id") ?? "");
  const category_id = String(formData.get("category_id") ?? "") || null;
  const type = String(formData.get("type") ?? "expense") as TransactionType;
  const amount = Number(formData.get("amount") ?? 0);
  const description = String(formData.get("description") ?? "").trim() || null;
  const occurred_at = String(formData.get("occurred_at") ?? "");

  if (!account_id) throw new Error("Selecciona una cuenta");
  if (!amount || amount <= 0) throw new Error("El monto debe ser mayor a 0");
  if (!occurred_at) throw new Error("Selecciona una fecha");

  const now = argentinaNow();
  const thisMonth = monthKey(now);
  const nextMonth = monthKey(new Date(now.getFullYear(), now.getMonth() + 1, 1));
  const checkBudget = type === "expense" && category_id && occurred_at.startsWith(thisMonth);

  if (await isDemo()) {
    demoStore.createTransaction({
      account_id,
      category_id,
      type,
      amount,
      description,
      occurred_at,
    });
    revalidateAll();
    if (!checkBudget) return { warning: null };
    const category = demoStore.getCategories().find((c) => c.id === category_id);
    const monthTx = demoStore.getTransactions().filter((t) => t.occurred_at.startsWith(thisMonth));
    return { warning: crossedBudgetWarning(category, monthTx, amount) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    account_id,
    category_id,
    type,
    amount,
    description,
    occurred_at,
  });

  if (error) throw new Error(error.message);

  revalidateAll();
  if (!checkBudget) return { warning: null };

  const [{ data: category }, { data: monthTx }] = await Promise.all([
    supabase.from("categories").select("*").eq("id", category_id).maybeSingle(),
    supabase
      .from("transactions")
      .select("*")
      .eq("type", "expense")
      .eq("category_id", category_id)
      .gte("occurred_at", `${thisMonth}-01`)
      .lt("occurred_at", `${nextMonth}-01`),
  ]);
  return {
    warning: crossedBudgetWarning(
      (category ?? undefined) as Category | undefined,
      (monthTx ?? []) as Transaction[],
      amount
    ),
  };
}

export async function deleteTransaction(transactionId: string) {
  if (await isDemo()) {
    demoStore.deleteTransaction(transactionId);
    revalidateAll();
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);

  if (error) throw new Error(error.message);

  revalidateAll();
}

export async function deleteTransactions(transactionIds: string[]) {
  if (transactionIds.length === 0) return;

  if (await isDemo()) {
    demoStore.deleteTransactions(transactionIds);
    revalidateAll();
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .in("id", transactionIds);

  if (error) throw new Error(error.message);

  revalidateAll();
}
