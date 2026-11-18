import type { Account, Transaction } from "@/lib/types";

export function accountBalance(account: Account, transactions: Transaction[]) {
  return transactions
    .filter((t) => t.account_id === account.id)
    .reduce((balance, t) => {
      return t.type === "income" ? balance + t.amount : balance - t.amount;
    }, Number(account.initial_balance));
}
