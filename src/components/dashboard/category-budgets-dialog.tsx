"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoneyInput } from "@/components/money-input";
import { setCategoryBudgets } from "@/app/dashboard/actions";
import type { Category } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function CategoryBudgetsDialog({
  categories,
  spentById,
}: {
  categories: Category[];
  spentById: Record<string, number>;
}) {
  const expenseCategories = categories.filter((c) => c.kind === "expense");
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();

  function save() {
    const entries = expenseCategories
      .filter((c) => c.id in values)
      .map((c) => ({ id: c.id, budget: values[c.id] > 0 ? values[c.id] : null }));
    startTransition(async () => {
      try {
        await setCategoryBudgets(entries);
        toast.success("Presupuestos guardados");
        setOpen(false);
        setValues({});
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudieron guardar");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="ghost" className="h-7 px-2.5 text-xs">
            Presupuestos
          </Button>
        }
      />
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <DialogHeader>
            <DialogTitle>Presupuesto por categoría</DialogTitle>
            <DialogDescription>
              Poné un tope mensual a las categorías que quieras controlar. Te avisamos cuando
              llegues al 80%. Dejalo vacío para no tener tope.
            </DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto py-4">
            {expenseCategories.map((c) => (
              <div key={c.id} className="grid grid-cols-[1fr_9.5rem] items-center gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{c.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Este mes: {formatCurrency(spentById[c.id] ?? 0)}
                  </p>
                </div>
                <MoneyInput
                  defaultValue={c.monthly_budget ? Number(c.monthly_budget) : undefined}
                  placeholder="Sin tope"
                  onValueChange={(v) => setValues((prev) => ({ ...prev, [c.id]: v }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
