"use client"

import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Account, Category } from "@/lib/types"
import { cn, formatCurrency } from "@/lib/utils"

import type { TransactionRow } from "./columns"

export type Period = "all" | "this-month" | "last-month" | "last-3" | "this-year" | "custom"

export interface Filters {
  query: string
  type: "all" | "income" | "expense"
  accountId: string
  categoryId: string
  period: Period
  from: string
  to: string
}

export const EMPTY_FILTERS: Filters = {
  query: "",
  type: "all",
  accountId: "all",
  categoryId: "all",
  period: "all",
  from: "",
  to: "",
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "all", label: "Todas las fechas" },
  { value: "this-month", label: "Este mes" },
  { value: "last-month", label: "Mes pasado" },
  { value: "last-3", label: "Últimos 3 meses" },
  { value: "this-year", label: "Este año" },
  { value: "custom", label: "Elegir fechas…" },
]

const TYPES = [
  { value: "all", label: "Gastos e ingresos" },
  { value: "expense", label: "Solo gastos" },
  { value: "income", label: "Solo ingresos" },
]

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** [from, to] (inclusive, YYYY-MM-DD) for a period; empty strings mean open-ended. */
function periodRange(f: Filters): [string, string] {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  switch (f.period) {
    case "this-month":
      return [iso(new Date(y, m, 1)), iso(new Date(y, m + 1, 0))]
    case "last-month":
      return [iso(new Date(y, m - 1, 1)), iso(new Date(y, m, 0))]
    case "last-3":
      return [iso(new Date(y, m - 2, 1)), iso(new Date(y, m + 1, 0))]
    case "this-year":
      return [`${y}-01-01`, `${y}-12-31`]
    case "custom":
      return [f.from, f.to]
    default:
      return ["", ""]
  }
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

/** Rows that match every filter. The search looks at description, account, category and amount. */
export function applyFilters(rows: TransactionRow[], f: Filters) {
  const [from, to] = periodRange(f)
  const words = normalize(f.query.trim()).split(/\s+/).filter(Boolean)
  return rows.filter((r) => {
    if (f.type !== "all" && r.type !== f.type) return false
    if (f.accountId !== "all" && r.account_id !== f.accountId) return false
    if (f.categoryId === "none" ? r.category_id : f.categoryId !== "all" && r.category_id !== f.categoryId)
      return false
    if (from && r.occurred_at < from) return false
    if (to && r.occurred_at > to) return false
    if (words.length) {
      const haystack = normalize(
        [r.description ?? "", r.accountName, r.category?.name ?? "", String(r.amount)].join(" ")
      )
      if (!words.every((w) => haystack.includes(w))) return false
    }
    return true
  })
}

export function activeFilterCount(f: Filters) {
  return (
    Number(f.type !== "all") +
    Number(f.accountId !== "all") +
    Number(f.categoryId !== "all") +
    Number(f.period !== "all")
  )
}

function FilterSelect({
  value,
  onChange,
  options,
  active,
  className,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  active: boolean
  className?: string
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(String(v ?? "all"))}>
      <SelectTrigger size="sm" className={cn("w-full sm:w-auto", active && "border-primary text-primary", className)}>
        <SelectValue>{(v: string | null) => options.find((o) => o.value === v)?.label ?? ""}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function TransactionFilters({
  filters,
  onChange,
  accounts,
  categories,
}: {
  filters: Filters
  onChange: (next: Filters) => void
  accounts: Account[]
  categories: Category[]
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value })
  const visibleCategories =
    filters.type === "all" ? categories : categories.filter((c) => c.kind === filters.type)
  const hasAny = activeFilterCount(filters) > 0 || filters.query !== ""

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por descripción, cuenta, categoría o monto…"
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <FilterSelect
          value={filters.period}
          onChange={(v) => set("period", v as Period)}
          options={PERIODS}
          active={filters.period !== "all"}
        />
        <FilterSelect
          value={filters.type}
          onChange={(v) => onChange({ ...filters, type: v as Filters["type"], categoryId: "all" })}
          options={TYPES}
          active={filters.type !== "all"}
        />
        <FilterSelect
          value={filters.accountId}
          onChange={(v) => set("accountId", v)}
          options={[{ value: "all", label: "Todas las cuentas" }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
          active={filters.accountId !== "all"}
        />
        <FilterSelect
          value={filters.categoryId}
          onChange={(v) => set("categoryId", v)}
          options={[
            { value: "all", label: "Todas las categorías" },
            ...visibleCategories.map((c) => ({ value: c.id, label: c.name })),
            { value: "none", label: "Sin categoría" },
          ]}
          active={filters.categoryId !== "all"}
        />
        {hasAny && (
          <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)} className="col-span-2 sm:col-span-1">
            <X className="size-4" /> Limpiar
          </Button>
        )}
      </div>
      {filters.period === "custom" && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Desde</span>
          <Input type="date" value={filters.from} onChange={(e) => set("from", e.target.value)} className="h-8 w-auto" />
          <span className="text-muted-foreground">hasta</span>
          <Input type="date" value={filters.to} onChange={(e) => set("to", e.target.value)} className="h-8 w-auto" />
        </div>
      )}
    </div>
  )
}

/** Count and totals of the filtered movements, per currency. */
export function FilterSummary({ rows }: { rows: TransactionRow[] }) {
  const byCurrency = new Map<string, { income: number; expense: number }>()
  for (const r of rows) {
    const t = byCurrency.get(r.currency) ?? { income: 0, expense: 0 }
    t[r.type] += Number(r.amount)
    byCurrency.set(r.currency, t)
  }
  const entries = [...byCurrency.entries()].sort(([a], [b]) => (a === "ARS" ? -1 : b === "ARS" ? 1 : 0))

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
      <span className="font-medium">
        {rows.length} movimiento{rows.length === 1 ? "" : "s"}
      </span>
      {entries.map(([currency, t]) => (
        <span key={currency} className="flex flex-wrap gap-x-4 tabular-nums">
          {t.income > 0 && <span className="text-success">+{formatCurrency(t.income, currency)}</span>}
          {t.expense > 0 && <span className="text-destructive">-{formatCurrency(t.expense, currency)}</span>}
          {t.income > 0 && t.expense > 0 && (
            <span className="text-muted-foreground">Neto {formatCurrency(t.income - t.expense, currency)}</span>
          )}
        </span>
      ))}
    </div>
  )
}
