"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/money-input";
import { addContribution } from "@/app/dashboard/goals/actions";

export function ContributionForm({ goalId }: { goalId: string }) {
  const [amount, setAmount] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(sign: 1 | -1) {
    const value = Number(amount.replace(",", "."));
    if (!value || value <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    startTransition(async () => {
      try {
        await addContribution(goalId, value * sign);
        toast.success(sign === 1 ? "Ahorro agregado" : "Retiro registrado");
        setAmount("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al actualizar la meta");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <MoneyInput
        placeholder="Monto"
        value={amount}
        onCleanChange={setAmount}
        className="w-36"
      />
      <Button size="sm" variant="outline" disabled={pending} onClick={() => submit(1)}>
        + Ahorrar
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => submit(-1)}>
        Retirar
      </Button>
    </div>
  );
}
