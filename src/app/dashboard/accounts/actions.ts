"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import type { AccountType } from "@/lib/types";

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/transactions");
}

export async function createAccount(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "cash") as AccountType;
  const currency = String(formData.get("currency") ?? "USD").trim() || "USD";
  const initial_balance = Number(formData.get("initial_balance") ?? 0);

  if (!name) throw new Error("El nombre de la cuenta es obligatorio");

  if (DEMO_MODE) {
    demoStore.createAccount({ name, type, currency, initial_balance });
    revalidateAll();
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    name,
    type,
    currency,
    initial_balance,
  });

  if (error) throw new Error(error.message);

  revalidateAll();
}

export async function deleteAccount(accountId: string) {
  if (DEMO_MODE) {
    demoStore.deleteAccount(accountId);
    revalidateAll();
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", accountId);

  if (error) throw new Error(error.message);

  revalidateAll();
}
