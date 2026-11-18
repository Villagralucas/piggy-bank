"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createTransaction } from "@/app/dashboard/transactions/actions";
import type { Account, Category, TransactionType } from "@/lib/types";
import { Plus } from "lucide-react";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionDialog({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<TransactionType>("expense");

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.kind === type),
    [categories, type]
  );

  function handleSubmit(formData: FormData) {
    formData.set("type", type);
    startTransition(async () => {
      try {
        await createTransaction(formData);
        toast.success("Movimiento registrado");
        setOpen(false);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error al registrar el movimiento"
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" disabled={accounts.length === 0}>
            <Plus className="size-4" />
            Nuevo movimiento
          </Button>
        }
      />
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo movimiento</DialogTitle>
            <DialogDescription>
              Registra un ingreso o gasto en una de tus cuentas.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <TabsList className="w-full">
                <TabsTrigger value="expense" className="flex-1">
                  Gasto
                </TabsTrigger>
                <TabsTrigger value="income" className="flex-1">
                  Ingreso
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="occurred_at">Fecha</Label>
                <Input
                  id="occurred_at"
                  name="occurred_at"
                  type="date"
                  defaultValue={todayISO()}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="account_id">Cuenta</Label>
              <Select name="account_id" required>
                <SelectTrigger id="account_id" className="w-full">
                  <SelectValue placeholder="Selecciona una cuenta">
                    {(value: string | null) =>
                      accounts.find((a) => a.id === value)?.name ??
                      "Selecciona una cuenta"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category_id">Categoría</Label>
              <Select name="category_id">
                <SelectTrigger id="category_id" className="w-full">
                  <SelectValue placeholder="Selecciona una categoría">
                    {(value: string | null) =>
                      filteredCategories.find((c) => c.id === value)?.name ??
                      "Selecciona una categoría"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input id="description" name="description" placeholder="Ej. Supermercado" />
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
