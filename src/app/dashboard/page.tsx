import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchAllTransactions } from "@/lib/queries";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import { syncRecurring } from "@/lib/recurring";
import { getMonthlyBudget } from "@/lib/settings";
import { getDollarRates, toPesos } from "@/lib/dollar";
import { DollarQuotes } from "@/components/dollar/dollar-quotes";
import type { Account, Category, SavingsGoal, Transaction } from "@/lib/types";
import { accountBalance } from "@/lib/balances";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { BudgetDialog } from "@/components/dashboard/budget-dialog";
import { TrendCard, type TrendPoint } from "@/components/dashboard/trend-card";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  PiggyBank,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MONTH_LONG = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function monthKeyOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function sumBy(list: Transaction[], type: Transaction["type"]) {
  return list.filter((t) => t.type === type).reduce((s, t) => s + Number(t.amount), 0);
}

/** % change vs. previous value, or null when there's nothing to compare against. */
function percentChange(current: number, previous: number) {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function DashboardPage() {
  await syncRecurring();
  let accountsList: Account[];
  let transactionsList: Transaction[];
  let categoriesList: Category[];
  let goalsList: SavingsGoal[];

  if (await isDemo()) {
    accountsList = demoStore.getAccounts();
    transactionsList = demoStore.getTransactions();
    categoriesList = demoStore.getCategories();
    goalsList = demoStore.getGoals();
  } else {
    const supabase = await createClient();
    const [{ data: accounts }, { data: transactions }, { data: categories }, { data: goals }] =
      await Promise.all([
        supabase.from("accounts").select("*").order("name", { ascending: true }),
        fetchAllTransactions(supabase).then((data) => ({ data })),
        supabase.from("categories").select("*").order("name", { ascending: true }),
        supabase.from("savings_goals").select("*"),
      ]);
    accountsList = (accounts ?? []) as Account[];
    transactionsList = (transactions ?? []) as Transaction[];
    categoriesList = (categories ?? []) as Category[];
    goalsList = (goals ?? []) as SavingsGoal[];
  }
  const [budget, rates] = await Promise.all([getMonthlyBudget(), getDollarRates()]);

  // Everything on this page is in pesos: movements of USD accounts are
  // converted at the chosen dollar (or left out if there's no quote today).
  const currencyOf = new Map(accountsList.map((a) => [a.id, a.currency]));
  const allTransactions = transactionsList;
  transactionsList = allTransactions
    .filter((t) => rates || currencyOf.get(t.account_id) !== "USD")
    .map((t) => ({ ...t, amount: toPesos(Number(t.amount), currencyOf.get(t.account_id) ?? "ARS", rates) }));
  const hasUsd = accountsList.some((a) => a.currency === "USD");

  const now = new Date();
  const thisKey = monthKeyOf(now);
  const prevKey = monthKeyOf(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const thisMonth = transactionsList.filter((t) => t.occurred_at.startsWith(thisKey));
  const prevMonth = transactionsList.filter((t) => t.occurred_at.startsWith(prevKey));

  const monthIncome = sumBy(thisMonth, "income");
  const monthExpense = sumBy(thisMonth, "expense");
  const monthBalance = monthIncome - monthExpense;
  const incomeChange = percentChange(monthIncome, sumBy(prevMonth, "income"));
  const expenseChange = percentChange(monthExpense, sumBy(prevMonth, "expense"));

  const totalAvailable = accountsList
    .filter((acc) => rates || acc.currency !== "USD")
    .reduce((sum, acc) => sum + toPesos(accountBalance(acc, allTransactions), acc.currency, rates), 0);
  const totalSaved = goalsList.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalGoalTarget = goalsList.reduce((s, g) => s + Number(g.target_amount), 0);

  const budgetLeft = budget !== null ? budget - monthExpense : null;
  const budgetUsed = budget ? Math.min(100, Math.round((monthExpense / budget) * 100)) : 0;

  // Spending by category this month, biggest first
  const categoryMap = new Map(categoriesList.map((c) => [c.id, c]));
  const byCategory = new Map<string, { name: string; color: string; value: number }>();
  for (const t of thisMonth.filter((t) => t.type === "expense")) {
    const c = t.category_id ? categoryMap.get(t.category_id) : undefined;
    const key = c?.name ?? "Sin categoría";
    const entry = byCategory.get(key) ?? { name: key, color: c?.color ?? "#94a3b8", value: 0 };
    entry.value += Number(t.amount);
    byCategory.set(key, entry);
  }
  const categoryRanking = [...byCategory.values()].sort((a, b) => b.value - a.value);
  const topCategory = categoryRanking[0]?.value ?? 0;

  // Last 12 months for the trend chart
  const trend: TrendPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthTx = transactionsList.filter((t) => t.occurred_at.startsWith(monthKeyOf(d)));
    trend.push({
      month: `${MONTH_SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      Ingresos: sumBy(monthTx, "income"),
      Gastos: sumBy(monthTx, "expense"),
    });
  }

  const recentTransactions = [...allTransactions]
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="finance-label">Resumen de {MONTH_LONG[now.getMonth()]}</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            {formatCurrency(totalAvailable)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Disponible entre todas tus cuentas
            {hasUsd && rates && ` · dólares al ${rates.selected.kind} (${formatCurrency(rates.selected.buy)})`}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
          {rates && <DollarQuotes rates={rates} className="sm:min-w-[22rem]" />}
          <TransactionDialog
            accounts={accountsList}
            categories={categoriesList}
            triggerLabel="Agregar movimiento"
            size="lg"
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Scale}
          label="Balance del mes"
          value={formatCurrency(monthBalance)}
          valueClassName={monthBalance >= 0 ? "text-success" : "text-destructive"}
          footer={
            <span className={monthBalance >= 0 ? "text-success" : "text-destructive"}>
              {monthBalance >= 0 ? "Cerrás en verde" : "Vas en rojo este mes"}
            </span>
          }
          note="Ingresos menos gastos del mes"
        />
        <StatCard
          icon={TrendingUp}
          label="Ingresos"
          value={formatCurrency(monthIncome)}
          footer={<Change value={incomeChange} goodWhenUp />}
          note="Lo que entró este mes"
        />
        <StatCard
          icon={TrendingDown}
          label="Gastos"
          value={formatCurrency(monthExpense)}
          action={<BudgetDialog budget={budget} />}
          footer={
            budget === null ? (
              <Change value={expenseChange} goodWhenUp={false} />
            ) : (
              <span className={budgetLeft! >= 0 ? "text-success" : "text-destructive"}>
                {budgetLeft! >= 0 ? "Dentro del presupuesto" : "Te pasaste del presupuesto"}
              </span>
            )
          }
          note={
            budget === null
              ? "Definí un presupuesto para controlarlo"
              : budgetLeft! >= 0
                ? `Te quedan ${formatCurrency(budgetLeft!)} de ${formatCurrency(budget)}`
                : `Gastaste ${formatCurrency(-budgetLeft!)} de más`
          }
        >
          {budget !== null && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  budgetUsed >= 100 ? "bg-destructive" : budgetUsed >= 80 ? "bg-chart-4" : "bg-success"
                )}
                style={{ width: `${budgetUsed}%` }}
              />
            </div>
          )}
        </StatCard>
        <StatCard
          icon={PiggyBank}
          label="Ahorro guardado"
          value={formatCurrency(totalSaved)}
          footer={
            <Link href="/dashboard/goals" className="inline-flex items-center gap-1 hover:underline">
              Mis metas <ArrowRight className="size-3.5" />
            </Link>
          }
          note={
            goalsList.length === 0
              ? "Todavía no tenés metas de ahorro"
              : `De ${formatCurrency(totalGoalTarget)} en ${goalsList.length} ${goalsList.length === 1 ? "meta" : "metas"}`
          }
        />
      </div>

      {/* Trend + categories */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="finance-card lg:col-span-3">
          <CardContent>
            <TrendCard data={trend} />
          </CardContent>
        </Card>
        <Card className="finance-card lg:col-span-2">
          <CardHeader>
            <p className="finance-label">Gastos por categoría</p>
            <CardTitle className="mt-1 font-heading text-xl">
              En qué se te fue la plata este mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryRanking.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay gastos este mes.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {categoryRanking.slice(0, 6).map((c) => (
                  <li key={c.name}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                      <span className="font-medium tabular-nums">{formatCurrency(c.value)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(4, Math.round((c.value / topCategory) * 100))}%`,
                          backgroundColor: c.color,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {Math.round((c.value / monthExpense) * 100)}% de tus gastos
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent */}
      <Card className="finance-card">
        <CardHeader className="flex flex-row items-end justify-between">
          <div>
            <p className="finance-label">Actividad reciente</p>
            <CardTitle className="mt-1 font-heading text-xl">Últimos movimientos</CardTitle>
          </div>
          <Link
            href="/dashboard/transactions"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todos <ArrowRight className="size-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {accountsList.length === 0
                ? "Empezá creando una cuenta (efectivo, banco…) en la sección Cuentas."
                : "Todavía no registraste movimientos."}
            </p>
          ) : (
            <div className="flex flex-col divide-y rounded-xl border px-4">
              {recentTransactions.map((t) => {
                const c = t.category_id ? categoryMap.get(t.category_id) : undefined;
                return (
                  <div key={t.id} className="flex items-center justify-between gap-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: c?.color ?? "#94a3b8" }}
                      />
                      <div>
                        <p className="text-sm font-medium">{t.description || "Sin descripción"}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(t.occurred_at)}
                          {c ? ` · ${c.name}` : ""}
                        </p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "font-heading font-semibold tabular-nums",
                        t.type === "income" ? "text-success" : "text-destructive"
                      )}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(Number(t.amount), currencyOf.get(t.account_id))}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  valueClassName,
  footer,
  note,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClassName?: string;
  footer: React.ReactNode;
  note: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Card className="finance-card">
      <CardContent className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="size-4" />
            {label}
          </span>
          {action}
        </div>
        <p className={cn("mt-3 font-heading text-2xl font-semibold tracking-tight tabular-nums", valueClassName)}>
          {value}
        </p>
        {children}
        <div className="mt-auto pt-4">
          <p className="text-sm font-medium">{footer}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Change({ value, goodWhenUp }: { value: number | null; goodWhenUp: boolean }) {
  if (value === null) {
    return <span className="text-muted-foreground">Sin mes anterior para comparar</span>;
  }
  const up = value >= 0;
  const good = up === goodWhenUp;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-1", good ? "text-success" : "text-destructive")}>
      <Arrow className="size-4" />
      {Math.abs(value)}% vs. el mes pasado
    </span>
  );
}
