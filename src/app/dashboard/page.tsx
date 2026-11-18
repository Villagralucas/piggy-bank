import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import type { Account, Transaction } from "@/lib/types";
import { accountBalance } from "@/lib/balances";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Landmark, PiggyBankIcon, Receipt, Wallet } from "lucide-react";

export default async function DashboardPage() {
  let accountsList: Account[];
  let transactionsList: Transaction[];

  if (DEMO_MODE) {
    accountsList = demoStore.getAccounts();
    transactionsList = demoStore.getTransactions();
  } else {
    const supabase = await createClient();
    const [{ data: accounts }, { data: transactions }] = await Promise.all([
      supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase
        .from("transactions")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(500),
    ]);
    accountsList = (accounts ?? []) as Account[];
    transactionsList = (transactions ?? []) as Transaction[];
  }

  const totalBalance = accountsList.reduce(
    (sum, acc) => sum + accountBalance(acc, transactionsList),
    0
  );

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = transactionsList.filter((t) =>
    t.occurred_at.startsWith(monthKey)
  );
  const monthIncome = thisMonth
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const monthExpense = thisMonth
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const recentTransactions = [...transactionsList]
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <div id="resumen" className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <Card className="finance-hero-card">
          <CardHeader className="flex flex-row items-start justify-between pb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Patrimonio disponible
              </p>
              <CardTitle className="mt-3 font-heading text-4xl font-semibold tracking-tight md:text-5xl">
                {formatCurrency(totalBalance)}
              </CardTitle>
            </div>
            <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="size-6" aria-hidden="true" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs font-medium text-muted-foreground">Ingresos del mes</p>
                <p className="mt-2 font-heading text-2xl font-semibold text-success">
                  {formatCurrency(monthIncome)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs font-medium text-muted-foreground">Gastos del mes</p>
                <p className="mt-2 font-heading text-2xl font-semibold text-destructive">
                  {formatCurrency(monthExpense)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            href: "/dashboard/accounts" as const,
            icon: Landmark,
            label: "Cuentas",
            description: "Administra tus cuentas y saldos",
          },
          {
            href: "/dashboard/goals" as const,
            icon: PiggyBankIcon,
            label: "Metas de ahorro",
            description: "Seguí el progreso de tus metas",
          },
          {
            href: "/dashboard/reports" as const,
            icon: Receipt,
            label: "Reportes",
            description: "Analizá tus ingresos y gastos",
          },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="finance-card h-full hover:border-primary/40">
              <CardContent className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <p className="font-heading font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div id="movimientos" className="grid gap-4">
        <Card className="finance-card">
          <CardHeader>
            <p className="finance-label">Actividad reciente</p>
            <CardTitle className="mt-2 font-heading text-2xl">Últimos movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no registras movimientos.
              </p>
            ) : (
              <div className="flex flex-col divide-y rounded-xl border px-4">
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm font-medium">
                        {t.description || "Sin descripción"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(t.occurred_at)}
                      </p>
                    </div>
                    <p
                      className={
                        t.type === "income"
                          ? "font-heading font-semibold text-success"
                          : "font-heading font-semibold text-destructive"
                      }
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}