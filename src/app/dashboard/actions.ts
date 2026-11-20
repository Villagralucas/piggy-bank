"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";

export async function setMonthlyBudget(amount: number | null) {
  if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
    throw new Error("Ingresá un monto válido");
  }

  if (await isDemo()) {
    demoStore.setMonthlyBudget(amount);
    revalidatePath("/dashboard");
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("user_settings").upsert({
    user_id: user.id,
    monthly_budget: amount,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(
      error.code === "42P01" || error.message.includes("user_settings")
        ? "Falta crear la tabla del presupuesto en Supabase (corré el SQL 002)."
        : error.message
    );
  }

  revalidatePath("/dashboard");
}

export async function setDollarKind(kind: "blue" | "oficial") {
  const { cookies } = await import("next/headers");
  const { DOLLAR_COOKIE } = await import("@/lib/dollar");
  const store = await cookies();
  store.set(DOLLAR_COOKIE, kind === "oficial" ? "oficial" : "blue", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/dashboard", "layout");
}

/** Saves the monthly budget of each expense category (null removes it). */
export async function setCategoryBudgets(entries: { id: string; budget: number | null }[]) {
  for (const e of entries) {
    if (e.budget !== null && (!Number.isFinite(e.budget) || e.budget < 0)) {
      throw new Error("Ingresá montos válidos");
    }
  }

  if (await isDemo()) {
    for (const e of entries) demoStore.setCategoryBudget(e.id, e.budget);
    revalidatePath("/dashboard", "layout");
    return;
  }

  const supabase = await createClient();
  for (const e of entries) {
    const { error } = await supabase.from("categories").update({ monthly_budget: e.budget }).eq("id", e.id);
    if (error) {
      throw new Error(
        error.code === "42703" || error.code === "PGRST204" || error.message.includes("monthly_budget")
          ? "Falta agregar el presupuesto por categoría en Supabase (corré el SQL 004)."
          : error.message
      );
    }
  }
  revalidatePath("/dashboard", "layout");
}
