import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import type { Account, Category, Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { TransactionsDataTable } from "@/components/transactions/data-table";
import type { TransactionRow } from "@/components/transactions/columns";
import {
  deleteTransaction,
  deleteTransactions,
} from "@/app/dashboard/transactions/actions";

export default async function TransactionsPage() {
  let accountsList: Account[];
  let categoriesList: Category[];
  let transactionsList: Transaction[];

  if (await isDemo()) {
    accountsList = [...demoStore.getAccounts()].sort((a, b) => a.name.localeCompare(b.name));
    categoriesList = [...demoStore.getCategories()].sort((a, b) => a.name.localeCompare(b.name));
    transactionsList = [...demoStore.getTransactions()].sort((a, b) =>
      b.occurred_at.localeCompare(a.occurred_at)
    );
  } else {
    const supabase = await createClient();
    const [{ data: accounts }, { data: categories }, { data: transactions }] =
      await Promise.all([
        supabase.from("accounts").select("*").order("name"),
        supabase.from("categories").select("*").order("name"),
        supabase
          .from("transactions")
          .select("*")
          .order("occurred_at", { ascending: false })
          .limit(300),
      ]);
    accountsList = (accounts ?? []) as Account[];
    categoriesList = (categories ?? []) as Category[];
    transactionsList = (transactions ?? []) as Transaction[];
  }

  const accountMap = new Map(accountsList.map((a) => [a.id, a]));
  const categoryMap = new Map(categoriesList.map((c) => [c.id, c]));

  const rows: TransactionRow[] = transactionsList.map((t) => ({
    ...t,
    accountName: accountMap.get(t.account_id)?.name ?? "—",
    category: t.category_id ? categoryMap.get(t.category_id) : undefined,
  }));

  return (
    <Card className="finance-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-xl">Movimientos</CardTitle>
        <TransactionDialog accounts={accountsList} categories={categoriesList} />
      </CardHeader>
      <CardContent>
        {accountsList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Primero crea una cuenta en el Resumen para poder registrar
            movimientos.
          </p>
        ) : transactionsList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay movimientos registrados.
          </p>
        ) : (
          <TransactionsDataTable
            data={rows}
            deleteTransaction={deleteTransaction}
            deleteTransactions={deleteTransactions}
          />
        )}
      </CardContent>
    </Card>
  );
}
