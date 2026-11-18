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
