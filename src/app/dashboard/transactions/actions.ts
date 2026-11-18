"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import type { TransactionType } from "@/lib/types";

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

  if (DEMO_MODE) {
    demoStore.createTransaction({
      account_id,
      category_id,
      type,
      amount,
      description,
      occurred_at,
    });
    revalidateAll();
    return;
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
}

export async function deleteTransaction(transactionId: string) {
  if (DEMO_MODE) {
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

  if (DEMO_MODE) {
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
