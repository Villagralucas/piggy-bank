import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DEFAULT_CURRENCY = "ARS"

export function formatCurrency(amount: number, currency = DEFAULT_CURRENCY) {
  const hasCents = Math.round(Math.abs(amount) * 100) % 100 !== 0
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCompactCurrency(amount: number, currency = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)
}

export function currencySymbol(currency = DEFAULT_CURRENCY) {
  if (currency === "ARS") return "$"
  if (currency === "USD") return "US$"
  return currency
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`))
}
