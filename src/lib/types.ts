export type AccountType = "cash" | "bank" | "card" | "savings" | "other";
export type TransactionType = "income" | "expense";
export type CategoryKind = "income" | "expense";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: string;
  initial_balance: number;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  kind: CategoryKind;
  color: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  occurred_at: string;
  created_at: string;
  recurring_id?: string | null;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  created_at: string;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  day_of_month: number;
  active: boolean;
  /** Last month already generated, as "YYYY-MM". */
  last_generated_month: string | null;
  created_at: string;
}
