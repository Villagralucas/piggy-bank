import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import type { Account, AccountType, Transaction } from "@/lib/types";
import { accountBalance } from "@/lib/balances";
import { formatCurrency } from "@/lib/utils";
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
  let accountsList: Account[];
  let transactionsList: Transaction[];

  if (await isDemo()) {
    accountsList = demoStore.getAccounts();
    transactionsList = demoStore.getTransactions();
  } else {
    const supabase = await createClient();
    const [{ data: accounts }, { data: transactions }] = await Promise.all([
      supabase.from("accounts").select("*").order("created_at", { ascending: true }),
      supabase.from("transactions").select("*").limit(500),
    ]);
    accountsList = (accounts ?? []) as Account[];
    transactionsList = (transactions ?? []) as Transaction[];
  }

  return (
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
                    confirmMessage="¿Seguro que quieres eliminar esta cuenta? También se eliminarán sus movimientos."
                  />
                </div>
                <p className="font-heading text-2xl font-semibold tracking-tight">
                  {formatCurrency(
                    accountBalance(account, transactionsList),
                    account.currency
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
