"use client";

import { useState, useTransition } from "react";
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
import { createAccount } from "@/app/dashboard/accounts/actions";
import { MoneyInput } from "@/components/money-input";
import { Plus } from "lucide-react";

const ACCOUNT_TYPES = [
  { value: "cash", label: "Efectivo" },
  { value: "bank", label: "Banco" },
  { value: "card", label: "Tarjeta" },
  { value: "savings", label: "Ahorros" },
  { value: "other", label: "Otro" },
];

const CURRENCIES = [
  { value: "ARS", label: "Pesos (ARS)" },
  { value: "USD", label: "Dólares (USD)" },
];

export function AccountDialog() {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState("ARS");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createAccount(formData);
        toast.success("Cuenta creada");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al crear la cuenta");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="size-4" />
            Nueva cuenta
          </Button>
        }
      />
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva cuenta</DialogTitle>
            <DialogDescription>
              Agrega una cuenta para registrar sus movimientos y saldo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" placeholder="Ej. Cuenta corriente" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select name="type" defaultValue="cash">
                <SelectTrigger id="type" className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      ACCOUNT_TYPES.find((t) => t.value === value)?.label ??
                      "Selecciona un tipo"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  name="currency"
                  value={currency}
                  onValueChange={(v) => setCurrency(String(v ?? "ARS"))}
                >
                  <SelectTrigger id="currency" className="w-full">
                    <SelectValue>
                      {(value: string | null) =>
                        CURRENCIES.find((c) => c.value === value)?.label ?? "Moneda"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="initial_balance">Saldo inicial</Label>
                <MoneyInput
                  id="initial_balance"
                  name="initial_balance"
                  currency={currency}
                />
              </div>
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
