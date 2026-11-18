"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/money-input";
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
import { createGoal } from "@/app/dashboard/goals/actions";
import { Plus } from "lucide-react";

export function GoalDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createGoal(formData);
        toast.success("Meta creada");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al crear la meta");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="size-4" />
            Nueva meta
          </Button>
        }
      />
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva meta de ahorro</DialogTitle>
            <DialogDescription>
              Define cuánto quieres ahorrar y para cuándo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" placeholder="Ej. Fondo de emergencia" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="target_amount">Monto objetivo</Label>
              <MoneyInput id="target_amount" name="target_amount" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="target_date">Fecha objetivo (opcional)</Label>
              <Input id="target_date" name="target_date" type="date" />
            </div>
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
