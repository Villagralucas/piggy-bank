"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { setMonthlyBudget } from "@/app/dashboard/actions";

export function BudgetDialog({ budget }: { budget: number | null }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(budget ?? 0);
  const [pending, startTransition] = useTransition();

  function save(value: number | null) {
    startTransition(async () => {
      try {
        await setMonthlyBudget(value);
        toast.success(value === null ? "Presupuesto quitado" : "Presupuesto guardado");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo guardar el presupuesto");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant={budget === null ? "default" : "ghost"}
            className="h-7 px-2.5 text-xs"
          >
            {budget === null ? "Definir presupuesto" : "Editar"}
          </Button>
        }
      />
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(amount);
          }}
        >
          <DialogHeader>
            <DialogTitle>Presupuesto mensual</DialogTitle>
            <DialogDescription>
              ¿Cuánto querés gastar como máximo por mes? Te mostramos cuánto te queda.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <Label htmlFor="monthly_budget">Monto</Label>
            <MoneyInput
              id="monthly_budget"
              defaultValue={budget ?? undefined}
              onValueChange={setAmount}
              required
            />
          </div>
          <DialogFooter className="gap-2">
            {budget !== null && (
              <Button type="button" variant="ghost" disabled={pending} onClick={() => save(null)}>
                Quitar presupuesto
              </Button>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
