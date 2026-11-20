"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import { fetchAllTransactions } from "@/lib/queries";
import type { CsvMovement } from "@/lib/csv";
import type { Account, Category, Transaction } from "@/lib/types";

const MAX_ROWS = 5000;
const NEW_CATEGORY_COLOR = "#64748b";

function key(s: string) {
  return s.trim().toLowerCase();
}

function fingerprint(t: Pick<Transaction, "occurred_at" | "type" | "amount" | "account_id" | "description">) {
  return [t.occurred_at, t.type, Number(t.amount).toFixed(2), t.account_id, key(t.description ?? "")].join("|");
}

/**
 * Imports movements from a CSV backup. Accounts and categories are matched by
 * name and created when missing. Movements that already exist (same date,
 * type, amount, account and description) are skipped, so importing the same
 * file twice doesn't duplicate anything.
 */
export async function importMovements(movements: CsvMovement[]) {
  if (movements.length === 0) throw new Error("No hay movimientos para importar");
  if (movements.length > MAX_ROWS) throw new Error(`Máximo ${MAX_ROWS} movimientos por archivo`);

  const demo = await isDemo();
  const supabase = demo ? null : await createClient();
  let userId = "demo-user";

  let accounts: Account[];
  let categories: Category[];
  let existing: Transaction[];
  if (!supabase) {
    accounts = demoStore.getAccounts();
    categories = demoStore.getCategories();
    existing = demoStore.getTransactions();
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");
    userId = user.id;
    const [{ data: a }, { data: c }, t] = await Promise.all([
      supabase.from("accounts").select("*"),
      supabase.from("categories").select("*"),
      fetchAllTransactions(supabase),
    ]);
    accounts = (a ?? []) as Account[];
    categories = (c ?? []) as Category[];
    existing = t;
  }

  // Accounts by name, creating the missing ones.
  const accountByName = new Map(accounts.map((a) => [key(a.name), a.id]));
  const newAccounts = new Map<string, { name: string; currency: string }>();
  for (const m of movements) {
    if (!accountByName.has(key(m.account)) && !newAccounts.has(key(m.account))) {
      newAccounts.set(key(m.account), { name: m.account, currency: m.currency === "USD" ? "USD" : "ARS" });
    }
  }
  for (const [k, a] of newAccounts) {
    if (!supabase) {
      accountByName.set(k, demoStore.createAccount({ name: a.name, type: "other", currency: a.currency, initial_balance: 0 }).id);
    } else {
      const { data, error } = await supabase
        .from("accounts")
        .insert({ user_id: userId, name: a.name, type: "other", currency: a.currency, initial_balance: 0 })
        .select("id")
        .single();
      if (error) throw new Error(`No se pudo crear la cuenta "${a.name}": ${error.message}`);
      accountByName.set(k, data.id);
    }
  }

  // Categories by name + kind, creating the missing ones.
  const catKey = (name: string, kind: string) => `${kind}|${key(name)}`;
  const categoryByName = new Map(categories.map((c) => [catKey(c.name, c.kind), c.id]));
  for (const m of movements) {
    if (!m.category) continue;
    const k = catKey(m.category, m.type);
    if (categoryByName.has(k)) continue;
    if (!supabase) {
      categoryByName.set(k, demoStore.createCategory({ name: m.category, kind: m.type, color: NEW_CATEGORY_COLOR }).id);
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert({ user_id: userId, name: m.category, kind: m.type, color: NEW_CATEGORY_COLOR })
        .select("id")
        .single();
      if (error) throw new Error(`No se pudo crear la categoría "${m.category}": ${error.message}`);
      categoryByName.set(k, data.id);
    }
  }

  // Count existing movements per fingerprint: each one "absorbs" one equal row
  // of the file, so re-importing a backup adds nothing but two real coffees
  // on the same day in a new file are both kept.
  const existingCount = new Map<string, number>();
  for (const t of existing) {
    const fp = fingerprint(t);
    existingCount.set(fp, (existingCount.get(fp) ?? 0) + 1);
  }
  const toInsert: Omit<Transaction, "id" | "created_at">[] = [];
  let duplicates = 0;
  for (const m of movements) {
    const row = {
      user_id: userId,
      account_id: accountByName.get(key(m.account))!,
      category_id: m.category ? (categoryByName.get(catKey(m.category, m.type)) ?? null) : null,
      type: m.type,
      amount: m.amount,
      description: m.description || null,
      occurred_at: m.occurred_at,
    };
    const fp = fingerprint(row);
    const left = existingCount.get(fp) ?? 0;
    if (left > 0) {
      existingCount.set(fp, left - 1);
      duplicates++;
      continue;
    }
    toInsert.push(row);
  }

  if (!supabase) {
    for (const row of toInsert) demoStore.createTransaction(row);
  } else {
    for (let i = 0; i < toInsert.length; i += 500) {
      const { error } = await supabase.from("transactions").insert(toInsert.slice(i, i + 500));
      if (error) throw new Error(error.message);
    }
  }

  revalidatePath("/dashboard", "layout");
  return { imported: toInsert.length, duplicates, newAccounts: newAccounts.size };
}
