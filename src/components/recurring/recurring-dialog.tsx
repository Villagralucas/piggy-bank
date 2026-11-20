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
import { MoneyInput } from "@/components/money-input";
import { createRecurring } from "@/app/dashboard/recurring/actions";
import type { Account, Category, TransactionType } from "@/lib/types";
import { Plus } from "lucide-react";

export function RecurringDialog({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<TransactionType>("expense");
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id ?? null);
  const [day, setDay] = useState(1);
  const currency = accounts.find((a) => a.id === accountId)?.currency ?? "ARS";
  const today = new Date().getDate();

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.kind === type),
    [categories, type],
  );

  function handleSubmit(formData: FormData) {
    formData.set("type", type);
    startTransition(async () => {
      try {
        await createRecurring(formData);
        toast.success(type === "expense" ? "Gasto fijo guardado" : "Ingreso fijo guardado");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo guardar");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" disabled={accounts.length === 0}>
            <Plus className="size-4" />
            Nuevo fijo
          </Button>
        }
      />
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo gasto o ingreso fijo</DialogTitle>
            <DialogDescription>
              Se carga solo todos los meses en el día que elijas. Ideal para alquiler,
              servicios, suscripciones o el sueldo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <TabsList className="w-full">
                <TabsTrigger value="expense" className="flex-1">Gasto</TabsTrigger>
                <TabsTrigger value="income" className="flex-1">Ingreso</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rec_description">Nombre</Label>
              <Input
                id="rec_description"
                name="description"
                placeholder={type === "expense" ? "Ej. Alquiler" : "Ej. Sueldo"}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="rec_amount">Monto</Label>
                <MoneyInput id="rec_amount" name="amount" currency={currency} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="rec_day">Día del mes</Label>
                <Input
                  id="rec_day"
                  name="day_of_month"
                  type="number"
                  min={1}
                  max={31}
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rec_account">Cuenta</Label>
              <Select
                name="account_id"
                required
                value={accountId}
                onValueChange={(v) => setAccountId(v ? String(v) : null)}
              >
                <SelectTrigger id="rec_account" className="w-full">
                  <SelectValue placeholder="Seleccioná una cuenta">
                    {(value: string | null) =>
                      accounts.find((a) => a.id === value)?.name ?? "Seleccioná una cuenta"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rec_category">Categoría</Label>
              <Select name="category_id">
                <SelectTrigger id="rec_category" className="w-full">
                  <SelectValue placeholder="Seleccioná una categoría">
                    {(value: string | null) =>
                      filteredCategories.find((c) => c.id === value)?.name ?? "Seleccioná una categoría"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {day >= 1 && day <= today && (
              <label className="flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3 text-sm">
                <input
                  type="checkbox"
                  name="include_this_month"
                  className="mt-0.5 size-4 accent-primary"
                />
                <span>
                  Cargarlo también este mes
                  <span className="block text-xs text-muted-foreground">
                    El día {day} ya pasó. Dejalo sin marcar si ya lo anotaste a mano.
                  </span>
                </span>
              </label>
            )}
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
