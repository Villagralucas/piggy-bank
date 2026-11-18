"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn, currencySymbol } from "@/lib/utils";

/** Keeps digits and a single decimal comma (max 2 decimals). "." is treated as a thousands separator. */
function sanitize(raw: string) {
  const cleaned = raw.replace(/[^\d,]/g, "");
  const [intRaw, ...rest] = cleaned.split(",");
  const intPart = intRaw.replace(/^0+(?=\d)/, "");
  if (rest.length === 0) return intPart;
  return `${intPart || "0"},${rest.join("").slice(0, 2)}`;
}

function formatDisplay(clean: string) {
  if (!clean) return "";
  const [intPart, decPart] = clean.split(",");
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decPart === undefined ? withDots : `${withDots},${decPart}`;
}

function toNumber(clean: string) {
  if (!clean) return NaN;
  return Number(clean.replace(",", "."));
}

function fromNumber(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) return "";
  const fixed = Math.round(value * 100) / 100;
  const [i, d] = String(fixed).split(".");
  return d ? `${i},${d}` : i;
}

/**
 * Money field that formats as you type: "$ 180.000,50".
 * Submits a plain number (e.g. "180000.5") under `name` for server actions,
 * and reports it through `onValueChange` for controlled use.
 */
export function MoneyInput({
  id,
  name,
  currency = "ARS",
  defaultValue,
  required,
  allowZero = false,
  placeholder = "0",
  className,
  onValueChange,
  onCleanChange,
  value,
}: {
  id?: string;
  name?: string;
  currency?: string;
  defaultValue?: number;
  required?: boolean;
  allowZero?: boolean;
  placeholder?: string;
  className?: string;
  onValueChange?: (value: number) => void;
  /** Raw text as typed, e.g. "1234,5" — pair with `value` for controlled use. */
  onCleanChange?: (clean: string) => void;
  /** Controlled value as a clean string ("1234,5"); pass "" to clear. */
  value?: string;
}) {
  const [internal, setInternal] = useState(() => fromNumber(defaultValue));
  const clean = value ?? internal;
  const numeric = toNumber(clean);
  const symbol = currencySymbol(currency);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = sanitize(e.target.value);
    const n = toNumber(next);
    const invalid = required && (Number.isNaN(n) || (allowZero ? n < 0 : n <= 0));
    e.target.setCustomValidity(invalid ? "Ingresá un monto mayor a 0" : "");
    if (value === undefined) setInternal(next);
    onValueChange?.(Number.isNaN(n) ? 0 : n);
    onCleanChange?.(next);
  }

  return (
    <div className={cn("relative h-8", className)}>
      <span className="pointer-events-none absolute inset-y-0 left-2.5 grid place-items-center text-sm font-medium text-muted-foreground">
        {symbol}
      </span>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        required={required}
        placeholder={placeholder}
        value={formatDisplay(clean)}
        onChange={handleChange}
        style={{ paddingLeft: `${symbol.length * 0.55 + 1.1}rem` }}
        className="h-full tabular-nums"
      />
      {name && <input type="hidden" name={name} value={Number.isNaN(numeric) ? "" : String(numeric)} />}
    </div>
  );
}
