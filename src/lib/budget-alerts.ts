import type { Category, Transaction } from "@/lib/types";

export const ALERT_THRESHOLD = 0.8;

export interface BudgetStatus {
  id: string;
  name: string;
  color: string;
  spent: number;
  budget: number;
  /** spent / budget, e.g. 0.85 */
  ratio: number;
}

/** Spending vs. budget for every expense category that has one, this month's movements given. */
export function categoryBudgetStatus(categories: Category[], monthTransactions: Transaction[]): BudgetStatus[] {
  const spent = new Map<string, number>();
  for (const t of monthTransactions) {
    if (t.type !== "expense" || !t.category_id) continue;
    spent.set(t.category_id, (spent.get(t.category_id) ?? 0) + Number(t.amount));
  }
  return categories
    .filter((c) => c.kind === "expense" && c.monthly_budget != null && Number(c.monthly_budget) > 0)
    .map((c) => {
      const budget = Number(c.monthly_budget);
      const s = spent.get(c.id) ?? 0;
      return { id: c.id, name: c.name, color: c.color, spent: s, budget, ratio: s / budget };
    });
}

/** Message for a category that crossed the alert threshold, or null. */
export function budgetAlertMessage(status: Pick<BudgetStatus, "name" | "ratio">) {
  if (status.ratio >= 1) return `Te pasaste del presupuesto de ${status.name}`;
  if (status.ratio >= ALERT_THRESHOLD) return `Ya usaste el ${Math.floor(status.ratio * 100)}% del presupuesto de ${status.name}`;
  return null;
}
