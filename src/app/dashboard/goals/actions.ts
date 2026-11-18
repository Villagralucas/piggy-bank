"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";

export async function createGoal(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const target_amount = Number(formData.get("target_amount") ?? 0);
  const target_date = String(formData.get("target_date") ?? "") || null;

  if (!name) throw new Error("El nombre de la meta es obligatorio");
  if (!target_amount || target_amount <= 0)
    throw new Error("La meta debe ser mayor a 0");

  if (await isDemo()) {
    demoStore.createGoal({ name, target_amount, target_date });
    revalidatePath("/dashboard/goals");
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("savings_goals").insert({
    user_id: user.id,
    name,
    target_amount,
    target_date,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/goals");
}

export async function addContribution(goalId: string, amount: number) {
  if (await isDemo()) {
    demoStore.addContribution(goalId, amount);
    revalidatePath("/dashboard/goals");
    return;
  }

  const supabase = await createClient();

  const { data: goal, error: fetchError } = await supabase
    .from("savings_goals")
    .select("current_amount")
    .eq("id", goalId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const newAmount = Number(goal.current_amount) + amount;

  const { error } = await supabase
    .from("savings_goals")
    .update({ current_amount: Math.max(0, newAmount) })
    .eq("id", goalId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/goals");
}

export async function deleteGoal(goalId: string) {
  if (await isDemo()) {
    demoStore.deleteGoal(goalId);
    revalidatePath("/dashboard/goals");
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("id", goalId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/goals");
}
