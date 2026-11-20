import { createClient } from "@/lib/supabase/server";
import { fetchAllTransactions } from "@/lib/queries";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import { syncRecurring } from "@/lib/recurring";
import type { Account, AccountType, Transaction } from "@/lib/types";
import { accountBalance } from "@/lib/balances";
import { formatCurrency } from "@/lib/utils";
import { getDollarRates, toPesos } from "@/lib/dollar";
import { DollarQuotes } from "@/components/dollar/dollar-quotes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountDialog } from "@/components/accounts/account-dialog";
import { DeleteButton } from "@/components/delete-button";
import { deleteAccount } from "@/app/dashboard/accounts/actions";

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash: "Efectivo",
  bank: "Banco",
  card: "Tarjeta",
  savings: "Ahorros",
  other: "Otro",
};

export default async function AccountsPage() {
  await syncRecurring();
  let accountsList: Account[];
  let transactionsList: Transaction[];

  if (await isDemo()) {
    accountsList = demoStore.getAccounts();
    transactionsList = demoStore.getTransactions();
  } else {
    const supabase = await createClient();
    const [{ data: accounts }, { data: transactions }] = await Promise.all([
      supabase.from("accounts").select("*").order("created_at", { ascending: true }),
      fetchAllTransactions(supabase).then((data) => ({ data })),
    ]);
    accountsList = (accounts ?? []) as Account[];
    transactionsList = (transactions ?? []) as Transaction[];
  }

  const rates = await getDollarRates();
  const balances = new Map(accountsList.map((a) => [a.id, accountBalance(a, transactionsList)]));
  const hasUsd = accountsList.some((a) => a.currency === "USD");
  const totalPesos = accountsList.reduce(
    (sum, a) => (a.currency === "USD" && !rates ? sum : sum + toPesos(balances.get(a.id)!, a.currency, rates)),
    0
  );

  return (
    <div className="flex flex-col gap-6">
    <Card className="finance-card">
      <CardContent className="grid gap-4 md:grid-cols-[1fr_minmax(0,26rem)] md:items-center">
        <div>
          <p className="finance-label">Total en pesos</p>
          <p className="mt-2 font-heading text-3xl font-semibold tracking-tight tabular-nums">
            {formatCurrency(totalPesos)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {!hasUsd
              ? "Si tenés ahorros en dólares, creá una cuenta en USD y la sumamos en pesos."
              : rates
                ? `Tus dólares convertidos al ${rates.selected.kind === "blue" ? "blue" : "oficial"} compra (${formatCurrency(rates.selected.buy)}).`
                : "No pudimos traer la cotización: el total no incluye tus cuentas en dólares."}
          </p>
        </div>
        {rates ? (
          <DollarQuotes rates={rates} />
        ) : (
          <p className="text-sm text-muted-foreground">Cotización del dólar no disponible ahora.</p>
        )}
      </CardContent>
    </Card>
    <Card className="finance-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-xl">Cuentas</CardTitle>
        <AccountDialog />
      </CardHeader>
      <CardContent>
        {accountsList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no tienes cuentas. Crea una para empezar a registrar movimientos.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {accountsList.map((account) => (
              <div
                key={account.id}
                className="finance-panel flex flex-col gap-3 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ACCOUNT_TYPE_LABELS[account.type]} · {account.currency}
                    </p>
                  </div>
                  <DeleteButton
                    id={account.id}
                    action={deleteAccount}
                    title={`¿Eliminar "${account.name}"?`}
                    description="También se borran todos sus movimientos. No se puede deshacer."
                  />
                </div>
                <div>
                  <p className="font-heading text-2xl font-semibold tracking-tight">
                    {formatCurrency(balances.get(account.id)!, account.currency)}
                  </p>
                  {account.currency === "USD" && rates && (
                    <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
                      ≈ {formatCurrency(toPesos(balances.get(account.id)!, "USD", rates))} al{" "}
                      {rates.selected.kind === "blue" ? "blue" : "oficial"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
