"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import { argentinaNow, monthKey, syncRecurring } from "@/lib/recurring";
import type { TransactionType } from "@/lib/types";

function revalidateAll() {
  revalidatePath("/dashboard", "layout");
}

const MISSING_TABLE = "Falta crear la tabla de gastos fijos en Supabase (corré el SQL 003).";

export async function createRecurring(formData: FormData) {
  const account_id = String(formData.get("account_id") ?? "");
  const category_id = String(formData.get("category_id") ?? "") || null;
  const type = String(formData.get("type") ?? "expense") as TransactionType;
  const amount = Number(formData.get("amount") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const day_of_month = Math.trunc(Number(formData.get("day_of_month") ?? 1));
  const includeThisMonth = formData.get("include_this_month") === "on";

  if (!description) throw new Error("Poné un nombre, ej. Alquiler");
  if (!account_id) throw new Error("Seleccioná una cuenta");
  if (!amount || amount <= 0) throw new Error("El monto debe ser mayor a 0");
  if (!(day_of_month >= 1 && day_of_month <= 31)) throw new Error("El día tiene que ser entre 1 y 31");

  // If this month's day already passed and the user doesn't want it loaded
  // (they probably already paid it), start counting from next month.
  const today = argentinaNow();
  const last_generated_month =
    !includeThisMonth && day_of_month <= today.getDate() ? monthKey(today) : null;

  const rule = { account_id, category_id, type, amount, description, day_of_month, last_generated_month };

  if (await isDemo()) {
    demoStore.createRecurring(rule);
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase.from("recurring_transactions").insert({ user_id: user.id, ...rule });
    if (error) throw new Error(error.code === "42P01" || error.code === "PGRST205" ? MISSING_TABLE : error.message);
  }

  await syncRecurring();
  revalidateAll();
}

export async function setRecurringActive(ruleId: string, active: boolean) {
  // Resuming a paused rule shouldn't load the months it was paused.
  const patch: { active: boolean; last_generated_month?: string } = { active };
  if (active) {
    const today = argentinaNow();
    const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    patch.last_generated_month = monthKey(prev);
  }

  if (await isDemo()) {
    const rule = demoStore.getRecurring().find((r) => r.id === ruleId);
    if (active && rule?.last_generated_month && rule.last_generated_month > patch.last_generated_month!) {
      delete patch.last_generated_month;
    }
    demoStore.updateRecurring(ruleId, patch);
  } else {
    const supabase = await createClient();
    if (active) {
      const { data } = await supabase
        .from("recurring_transactions")
        .select("last_generated_month")
        .eq("id", ruleId)
        .maybeSingle();
      if (data?.last_generated_month && data.last_generated_month > patch.last_generated_month!) {
        delete patch.last_generated_month;
      }
    }
    const { error } = await supabase.from("recurring_transactions").update(patch).eq("id", ruleId);
    if (error) throw new Error(error.message);
  }

  await syncRecurring();
  revalidateAll();
}

export async function deleteRecurring(ruleId: string) {
  if (await isDemo()) {
    demoStore.deleteRecurring(ruleId);
  } else {
    const supabase = await createClient();
    const { error } = await supabase.from("recurring_transactions").delete().eq("id", ruleId);
    if (error) throw new Error(error.message);
  }
  revalidateAll();
}
