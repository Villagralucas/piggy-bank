"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
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
import { createAccount } from "@/app/dashboard/accounts/actions";
import { MoneyInput } from "@/components/money-input";
import type { Account, Category, TransactionType } from "@/lib/types";
import { Plus } from "lucide-react";
import { QUICK_ADD_EVENT } from "@/components/quick-add-button";

const LAST_ACCOUNT_KEY = "pb:last-account";

function readLastAccount() {
  try {
    return localStorage.getItem(LAST_ACCOUNT_KEY);
  } catch {
    return null;
  }
}

function subscribeNoop() {
  return () => {};
}

/** Today in the user's local time (toISOString would give tomorrow late at night in Argentina). */
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function TransactionDialog({
  accounts,
  categories,
  triggerLabel = "Nuevo movimiento",
  size = "sm",
  defaultOpen = false,
  defaultType = "expense",
  listenQuickAdd = false,
}: {
  accounts: Account[];
  categories: Category[];
  triggerLabel?: string;
  size?: "sm" | "default" | "lg";
  /** Open right away, e.g. from the app's "Cargar gasto" shortcut. */
  defaultOpen?: boolean;
  defaultType?: TransactionType;
  /** Open when the floating "+" button is tapped (only one dialog per page should). */
  listenQuickAdd?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<TransactionType>(defaultType);

  // Drop ?nuevo=… from the URL so a reload doesn't open the form again, and
  // let the floating "+" button open this form while already on the page.
  useEffect(() => {
    if (!defaultOpen && !listenQuickAdd) return;
    if (defaultOpen) window.history.replaceState(null, "", window.location.pathname);
    const openExpense = () => {
      setType("expense");
      setOpen(true);
    };
    window.addEventListener(QUICK_ADD_EVENT, openExpense);
    return () => window.removeEventListener(QUICK_ADD_EVENT, openExpense);
  }, [defaultOpen, listenQuickAdd]);
  const [chosenAccountId, setAccountId] = useState<string | null>(null);
  // Until the user picks one, start with the account used last time, so a
  // quick expense is just amount + save.
  const lastAccountId = useSyncExternalStore(subscribeNoop, readLastAccount, () => null);
  const accountId =
    chosenAccountId ??
    (accounts.some((a) => a.id === lastAccountId) ? lastAccountId : (accounts[0]?.id ?? null));
  const currency = accounts.find((a) => a.id === accountId)?.currency ?? "ARS";

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.kind === type),
    [categories, type],
  );

  function handleSubmit(formData: FormData) {
    formData.set("type", type);
    startTransition(async () => {
      try {
        const { warning } = await createTransaction(formData);
        try {
          localStorage.setItem(LAST_ACCOUNT_KEY, String(formData.get("account_id")));
        } catch {}
        toast.success("Movimiento registrado");
        if (warning) toast.warning(warning, { duration: 8000 });
        setOpen(false);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Error al registrar el movimiento",
        );
      }
    });
  }

  function createCashAccount() {
    const data = new FormData();
    data.set("name", "Efectivo");
    data.set("type", "cash");
    data.set("currency", "ARS");
    data.set("initial_balance", "0");
    startTransition(async () => {
      try {
        await createAccount(data);
        toast.success('Cuenta "Efectivo" creada');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "No se pudo crear la cuenta",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size={size}>
            <Plus className="size-4" />
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent>
        {accounts.length === 0 ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>
                Primero necesitás dónde guardar la plata
              </DialogTitle>
              <DialogDescription>
                Cada movimiento se anota en una cuenta de dinero, como tu
                efectivo o tu banco (no es tu usuario). Te creamos una
                &quot;Efectivo&quot; en pesos para empezar, y después podés
                sumar más en la sección Cuentas.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href="/dashboard/accounts" />}
              >
                Ir a Cuentas
              </Button>
              <Button disabled={pending} onClick={createCashAccount}>
                {pending ? "Creando..." : 'Crear "Efectivo" y seguir'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form action={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Nuevo movimiento</DialogTitle>
              <DialogDescription>
                Registra un ingreso o gasto en una de tus cuentas.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Tabs
                value={type}
                onValueChange={(v) => setType(v as TransactionType)}
              >
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
                  <MoneyInput
                    id="amount"
                    name="amount"
                    currency={currency}
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
                <Select
                  name="account_id"
                  required
                  value={accountId}
                  onValueChange={(v) => setAccountId(v ? String(v) : null)}
                >
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
                <Input
                  id="description"
                  name="description"
                  placeholder="Ej. Supermercado"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
