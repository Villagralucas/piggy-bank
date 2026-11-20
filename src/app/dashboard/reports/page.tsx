import { createClient } from "@/lib/supabase/server";
import { fetchAllTransactions } from "@/lib/queries";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import { syncRecurring } from "@/lib/recurring";
import type { Category, Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SpendingByCategoryChart,
  type CategorySlice,
} from "@/components/reports/spending-by-category-chart";
import {
  MonthlyTrendChart,
  type MonthlyPoint,
} from "@/components/reports/monthly-trend-chart";

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export default async function ReportsPage() {
  await syncRecurring();
  let categoriesList: Category[];
  let transactionsList: Transaction[];

  if (await isDemo()) {
    categoriesList = demoStore.getCategories();
    transactionsList = [...demoStore.getTransactions()].sort((a, b) =>
      a.occurred_at.localeCompare(b.occurred_at)
    );
  } else {
    const supabase = await createClient();
    const [{ data: categories }, { data: transactions }] = await Promise.all([
      supabase.from("categories").select("*"),
      fetchAllTransactions(supabase, { ascending: true }).then((data) => ({ data })),
    ]);
    categoriesList = (categories ?? []) as Category[];
    transactionsList = (transactions ?? []) as Transaction[];
  }
  const categoryMap = new Map(categoriesList.map((c) => [c.id, c]));

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthExpenses = transactionsList.filter(
    (t) => t.type === "expense" && t.occurred_at.startsWith(monthKey)
  );

  const spendingByCategory = new Map<string, CategorySlice>();
  for (const t of monthExpenses) {
    const category = t.category_id ? categoryMap.get(t.category_id) : undefined;
    const key = category?.name ?? "Sin categoría";
    const color = category?.color ?? "#94a3b8";
    const existing = spendingByCategory.get(key);
    if (existing) {
      existing.value += t.amount;
    } else {
      spendingByCategory.set(key, { name: key, value: t.amount, color });
    }
  }

  const last6Months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${MONTH_LABELS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
    });
  }

  const trendData: MonthlyPoint[] = last6Months.map(({ key, label }) => {
    const monthTx = transactionsList.filter((t) => t.occurred_at.startsWith(key));
    return {
      month: label,
      Ingresos: monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      Gastos: monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Gastos por categoría (este mes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpendingByCategoryChart data={Array.from(spendingByCategory.values())} />
        </CardContent>
      </Card>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Ingresos vs. gastos (últimos 6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyTrendChart data={trendData} />
        </CardContent>
      </Card>
    </div>
  );
}
