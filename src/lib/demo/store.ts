import type { Account, Category, RecurringTransaction, SavingsGoal, Transaction } from "@/lib/types";

const DEMO_USER_ID = "demo-user";

function uid() {
  return crypto.randomUUID();
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const now = new Date().toISOString();

const demoCategories: Category[] = [
  { id: uid(), user_id: DEMO_USER_ID, name: "Salario", kind: "income", color: "#22c55e", created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, name: "Otros ingresos", kind: "income", color: "#16a34a", created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, name: "Comida", kind: "expense", color: "#f97316", created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, name: "Transporte", kind: "expense", color: "#0ea5e9", created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, name: "Vivienda", kind: "expense", color: "#a855f7", created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, name: "Servicios", kind: "expense", color: "#eab308", created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, name: "Entretenimiento", kind: "expense", color: "#ec4899", created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, name: "Salud", kind: "expense", color: "#ef4444", created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, name: "Otros gastos", kind: "expense", color: "#64748b", created_at: now },
];

function categoryId(name: string) {
  return demoCategories.find((c) => c.name === name)!.id;
}

const demoAccounts: Account[] = [
  { id: uid(), user_id: DEMO_USER_ID, name: "Cuenta corriente", type: "bank", currency: "ARS", initial_balance: 1200000, created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, name: "Efectivo", type: "cash", currency: "ARS", initial_balance: 80000, created_at: now },
];

function accountId(name: string) {
  return demoAccounts.find((a) => a.name === name)!.id;
}

type DemoTransactionSeed = [
  daysAgo: number,
  account: "Cuenta corriente" | "Efectivo",
  category: string,
  type: "income" | "expense",
  amount: number,
  description: string,
];

const demoTransactionSeeds: DemoTransactionSeed[] = [
  [88, "Cuenta corriente", "Salario", "income", 1500, "Sueldo"],
  [87, "Cuenta corriente", "Vivienda", "expense", 450, "Alquiler"],
  [85, "Efectivo", "Comida", "expense", 62, "Supermercado"],
  [83, "Cuenta corriente", "Servicios", "expense", 88, "Luz y agua"],
  [80, "Efectivo", "Transporte", "expense", 38, "Nafta"],
  [78, "Cuenta corriente", "Entretenimiento", "expense", 32, "Cine"],
  [75, "Efectivo", "Comida", "expense", 25, "Almuerzo afuera"],
  [73, "Cuenta corriente", "Otros ingresos", "income", 110, "Venta usado"],
  [70, "Efectivo", "Salud", "expense", 45, "Farmacia"],
  [68, "Cuenta corriente", "Transporte", "expense", 55, "Colectivo mensual"],
  [65, "Cuenta corriente", "Comida", "expense", 71, "Supermercado"],
  [62, "Efectivo", "Entretenimiento", "expense", 20, "Streaming"],
  [60, "Cuenta corriente", "Salario", "income", 1500, "Sueldo"],
  [59, "Cuenta corriente", "Vivienda", "expense", 450, "Alquiler"],
  [57, "Efectivo", "Comida", "expense", 58, "Supermercado"],
  [55, "Cuenta corriente", "Servicios", "expense", 92, "Luz y agua"],
  [52, "Efectivo", "Transporte", "expense", 41, "Nafta"],
  [50, "Cuenta corriente", "Otros gastos", "expense", 30, "Ferretería"],
  [48, "Efectivo", "Comida", "expense", 33, "Almuerzo afuera"],
  [46, "Cuenta corriente", "Entretenimiento", "expense", 48, "Recital"],
  [44, "Cuenta corriente", "Otros ingresos", "income", 200, "Freelance"],
  [41, "Efectivo", "Salud", "expense", 27, "Farmacia"],
  [39, "Cuenta corriente", "Comida", "expense", 66, "Supermercado"],
  [37, "Efectivo", "Transporte", "expense", 36, "Nafta"],
  [34, "Cuenta corriente", "Servicios", "expense", 40, "Internet"],
  [32, "Efectivo", "Comida", "expense", 22, "Almuerzo afuera"],
  [31, "Cuenta corriente", "Salario", "income", 1550, "Sueldo"],
  [30, "Cuenta corriente", "Vivienda", "expense", 450, "Alquiler"],
  [28, "Efectivo", "Entretenimiento", "expense", 29, "Cine"],
  [26, "Cuenta corriente", "Comida", "expense", 74, "Supermercado"],
  [24, "Efectivo", "Transporte", "expense", 39, "Nafta"],
  [22, "Cuenta corriente", "Servicios", "expense", 85, "Luz y agua"],
  [20, "Efectivo", "Comida", "expense", 65, "Supermercado"],
  [18, "Cuenta corriente", "Otros gastos", "expense", 55, "Regalo cumpleaños"],
  [16, "Efectivo", "Salud", "expense", 50, "Consulta médica"],
  [15, "Cuenta corriente", "Otros ingresos", "income", 300, "Reembolso"],
  [14, "Efectivo", "Transporte", "expense", 40, "Nafta"],
  [12, "Cuenta corriente", "Entretenimiento", "expense", 60, "Cena afuera"],
  [10, "Efectivo", "Comida", "expense", 28, "Almuerzo afuera"],
  [8, "Cuenta corriente", "Servicios", "expense", 45, "Telefonía"],
  [6, "Efectivo", "Comida", "expense", 31, "Supermercado"],
  [5, "Cuenta corriente", "Entretenimiento", "expense", 35, "Cine"],
  [3, "Cuenta corriente", "Otros ingresos", "income", 120, "Venta usado"],
  [2, "Efectivo", "Transporte", "expense", 18, "Nafta"],
  [1, "Cuenta corriente", "Comida", "expense", 42, "Supermercado"],
];

const demoTransactions: Transaction[] = demoTransactionSeeds.map(
  ([days, account, category, type, amount, description]) => ({
    id: uid(),
    user_id: DEMO_USER_ID,
    account_id: accountId(account),
    category_id: categoryId(category),
    type,
    amount: amount * 1000,
    description,
    occurred_at: daysAgo(days),
    created_at: now,
  })
);

const demoGoals: SavingsGoal[] = [
  { id: uid(), user_id: DEMO_USER_ID, name: "Fondo de emergencia", target_amount: 3000000, current_amount: 850000, target_date: null, created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, name: "Vacaciones", target_amount: 800000, current_amount: 200000, target_date: daysAgo(-90), created_at: now },
];

const thisMonth = new Date().toISOString().slice(0, 7);

const demoRecurring: RecurringTransaction[] = [
  { id: uid(), user_id: DEMO_USER_ID, account_id: accountId("Cuenta corriente"), category_id: categoryId("Salario"), type: "income", amount: 1550000, description: "Sueldo", day_of_month: 1, active: true, last_generated_month: thisMonth, created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, account_id: accountId("Cuenta corriente"), category_id: categoryId("Vivienda"), type: "expense", amount: 450000, description: "Alquiler", day_of_month: 1, active: true, last_generated_month: thisMonth, created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, account_id: accountId("Cuenta corriente"), category_id: categoryId("Servicios"), type: "expense", amount: 40000, description: "Internet", day_of_month: 10, active: true, last_generated_month: thisMonth, created_at: now },
  { id: uid(), user_id: DEMO_USER_ID, account_id: accountId("Efectivo"), category_id: categoryId("Entretenimiento"), type: "expense", amount: 20000, description: "Streaming", day_of_month: 15, active: false, last_generated_month: thisMonth, created_at: now },
];

let demoMonthlyBudget: number | null = 1500000;

export const demoStore = {
  getMonthlyBudget(): number | null {
    return demoMonthlyBudget;
  },
  setMonthlyBudget(amount: number | null) {
    demoMonthlyBudget = amount;
  },

  getAccounts(): Account[] {
    return demoAccounts;
  },
  getCategories(): Category[] {
    return demoCategories;
  },
  getTransactions(): Transaction[] {
    return demoTransactions;
  },
  getGoals(): SavingsGoal[] {
    return demoGoals;
  },

  createAccount(data: Pick<Account, "name" | "type" | "currency" | "initial_balance">) {
    const account: Account = { id: uid(), user_id: DEMO_USER_ID, created_at: new Date().toISOString(), ...data };
    demoAccounts.push(account);
    return account;
  },
  deleteAccount(accountId: string) {
    const idx = demoAccounts.findIndex((a) => a.id === accountId);
    if (idx >= 0) demoAccounts.splice(idx, 1);
    for (let i = demoTransactions.length - 1; i >= 0; i--) {
      if (demoTransactions[i].account_id === accountId) demoTransactions.splice(i, 1);
    }
    for (let i = demoRecurring.length - 1; i >= 0; i--) {
      if (demoRecurring[i].account_id === accountId) demoRecurring.splice(i, 1);
    }
  },

  createTransaction(
    data: Pick<Transaction, "account_id" | "category_id" | "type" | "amount" | "description" | "occurred_at"> &
      Partial<Pick<Transaction, "recurring_id">>
  ) {
    const transaction: Transaction = { id: uid(), user_id: DEMO_USER_ID, created_at: new Date().toISOString(), ...data };
    demoTransactions.push(transaction);
    return transaction;
  },
  deleteTransaction(transactionId: string) {
    const idx = demoTransactions.findIndex((t) => t.id === transactionId);
    if (idx >= 0) demoTransactions.splice(idx, 1);
  },
  deleteTransactions(transactionIds: string[]) {
    const ids = new Set(transactionIds);
    for (let i = demoTransactions.length - 1; i >= 0; i--) {
      if (ids.has(demoTransactions[i].id)) demoTransactions.splice(i, 1);
    }
  },

  getRecurring(): RecurringTransaction[] {
    return demoRecurring;
  },
  createRecurring(
    data: Pick<RecurringTransaction, "account_id" | "category_id" | "type" | "amount" | "description" | "day_of_month" | "last_generated_month">
  ) {
    const rule: RecurringTransaction = { id: uid(), user_id: DEMO_USER_ID, created_at: new Date().toISOString(), active: true, ...data };
    demoRecurring.push(rule);
    return rule;
  },
  updateRecurring(ruleId: string, data: Partial<Pick<RecurringTransaction, "active" | "last_generated_month">>) {
    const rule = demoRecurring.find((r) => r.id === ruleId);
    if (rule) Object.assign(rule, data);
  },
  deleteRecurring(ruleId: string) {
    const idx = demoRecurring.findIndex((r) => r.id === ruleId);
    if (idx >= 0) demoRecurring.splice(idx, 1);
  },

  createGoal(data: Pick<SavingsGoal, "name" | "target_amount" | "target_date">) {
    const goal: SavingsGoal = { id: uid(), user_id: DEMO_USER_ID, created_at: new Date().toISOString(), current_amount: 0, ...data };
    demoGoals.push(goal);
    return goal;
  },
  addContribution(goalId: string, amount: number) {
    const goal = demoGoals.find((g) => g.id === goalId);
    if (goal) goal.current_amount = Math.max(0, Number(goal.current_amount) + amount);
  },
  deleteGoal(goalId: string) {
    const idx = demoGoals.findIndex((g) => g.id === goalId);
    if (idx >= 0) demoGoals.splice(idx, 1);
  },
};
