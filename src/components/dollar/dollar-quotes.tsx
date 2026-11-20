"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setDollarKind } from "@/app/dashboard/actions";
import type { DollarKind, DollarRates } from "@/lib/dollar";
import { cn, formatCurrency } from "@/lib/utils";

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso));
}

/**
 * Today's blue and official dollar. Tapping one makes it the rate used to
 * show USD accounts in pesos.
 */
export function DollarQuotes({ rates, className }: { rates: DollarRates; className?: string }) {
  const [pending, startTransition] = useTransition();

  function choose(kind: DollarKind) {
    if (kind === rates.selected.kind) return;
    startTransition(async () => {
      try {
        await setDollarKind(kind);
        toast.success(`Ahora usamos el dólar ${kind === "blue" ? "blue" : "oficial"} para tus cuentas en USD`);
      } catch {
        toast.error("No se pudo cambiar la cotización");
      }
    });
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2", pending && "opacity-60", className)}>
      {[rates.blue, rates.oficial].map((q) => {
        const selected = q.kind === rates.selected.kind;
        return (
          <button
            key={q.kind}
            type="button"
            onClick={() => choose(q.kind)}
            disabled={pending}
            aria-pressed={selected}
            className={cn(
              "rounded-xl border px-3 py-2 text-left transition-colors",
              selected ? "border-primary bg-primary/10" : "bg-card hover:bg-muted/60"
            )}
          >
            <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              Dólar {q.kind === "blue" ? "blue" : "oficial"}
              {selected && <span className="font-medium text-primary">En uso</span>}
            </span>
            <span className="mt-0.5 block font-heading text-base font-semibold tabular-nums">
              {formatCurrency(q.buy)} <span className="text-muted-foreground">/</span> {formatCurrency(q.sell)}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Compra / venta · {timeLabel(q.updatedAt)} hs
            </span>
          </button>
        );
      })}
    </div>
  );
}
