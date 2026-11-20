import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import { argentinaNow, dueDate, monthKey, syncRecurring } from "@/lib/recurring";
import type { Account, Category, RecurringTransaction } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecurringDialog } from "@/components/recurring/recurring-dialog";
import { RecurringActions } from "@/components/recurring/recurring-actions";

/** Next date a rule will load: this month if its day hasn't been generated yet, else next month. */
function nextDate(rule: RecurringTransaction, today: Date) {
  const current = monthKey(today);
  const key =
    rule.last_generated_month && rule.last_generated_month >= current
      ? monthKey(new Date(today.getFullYear(), today.getMonth() + 1, 1))
      : current;
  return dueDate(key, rule.day_of_month);
}

export default async function RecurringPage() {
  await syncRecurring();

  let accountsList: Account[];
  let categoriesList: Category[];
  let rules: RecurringTransaction[];
  let missingTable = false;

  if (await isDemo()) {
    accountsList = demoStore.getAccounts();
    categoriesList = demoStore.getCategories();
    rules = demoStore.getRecurring();
  } else {
    const supabase = await createClient();
    const [{ data: accounts }, { data: categories }, { data: recurring, error }] = await Promise.all([
      supabase.from("accounts").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase.from("recurring_transactions").select("*").order("day_of_month"),
    ]);
    accountsList = (accounts ?? []) as Account[];
    categoriesList = (categories ?? []) as Category[];
    rules = (recurring ?? []) as RecurringTransaction[];
    missingTable = !!error;
  }

  const accountMap = new Map(accountsList.map((a) => [a.id, a]));
  const categoryMap = new Map(categoriesList.map((c) => [c.id, c]));
  const sorted = [...rules].sort(
    (a, b) => Number(b.active) - Number(a.active) || a.day_of_month - b.day_of_month
  );
  const active = rules.filter((r) => r.active);
  const fixedExpense = active.filter((r) => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);
  const fixedIncome = active.filter((r) => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
  const today = argentinaNow();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="finance-card">
          <CardContent>
            <p className="finance-label">Gastos fijos por mes</p>
            <p className="mt-2 font-heading text-2xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(fixedExpense)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {fixedIncome > 0
                ? `Se lleva el ${Math.round((fixedExpense / fixedIncome) * 100)}% de tus ingresos fijos`
                : "Lo que sale sí o sí todos los meses"}
            </p>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardContent>
            <p className="finance-label">Ingresos fijos por mes</p>
            <p className="mt-2 font-heading text-2xl font-semibold tracking-tight tabular-nums text-success">
              {formatCurrency(fixedIncome)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Te quedan {formatCurrency(fixedIncome - fixedExpense)} después de los fijos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="font-heading text-xl">Gastos e ingresos fijos</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Se cargan solos en Movimientos el día que elegiste de cada mes.
            </p>
          </div>
          <RecurringDialog accounts={accountsList} categories={categoriesList} />
        </CardHeader>
        <CardContent>
          {missingTable ? (
            <p className="text-sm text-muted-foreground">
              Falta crear la tabla en Supabase. Corré el archivo{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">supabase/003-gastos-fijos.sql</code>{" "}
              en el SQL Editor y recargá.
            </p>
          ) : accountsList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Primero creá una cuenta en la sección Cuentas.
            </p>
          ) : sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no cargaste gastos fijos. Sumá el alquiler, la luz, el gimnasio o el sueldo
              y no los vuelvas a anotar a mano.
            </p>
          ) : (
            <div className="flex flex-col divide-y rounded-xl border px-4">
              {sorted.map((rule) => {
                const c = rule.category_id ? categoryMap.get(rule.category_id) : undefined;
                const account = accountMap.get(rule.account_id);
                return (
                  <div
                    key={rule.id}
                    className={cn("flex items-center justify-between gap-4 py-3.5", !rule.active && "opacity-55")}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: c?.color ?? "#94a3b8" }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{rule.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Día {rule.day_of_month}
                          {account ? ` · ${account.name}` : ""}
                          {c ? ` · ${c.name}` : ""}
                          {" · "}
                          {rule.active ? `Próximo: ${formatDate(nextDate(rule, today))}` : "Pausado"}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <p
                        className={cn(
                          "font-heading font-semibold tabular-nums",
                          rule.type === "income" ? "text-success" : "text-destructive"
                        )}
                      >
                        {rule.type === "income" ? "+" : "-"}
                        {formatCurrency(Number(rule.amount), account?.currency)}
                      </p>
                      <RecurringActions id={rule.id} active={rule.active} />
                    </div>
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
