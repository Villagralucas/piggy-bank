"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { csvToMovements, type CsvMovement } from "@/lib/csv";
import { importMovements } from "@/app/dashboard/transactions/import-action";
import { formatCurrency, formatDate } from "@/lib/utils";

const CHUNK = 1000;

/** "Exportar" downloads every movement as CSV; "Importar" loads one back. */
export function BackupButtons() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ name: string; movements: CsvMovement[]; skipped: number } | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    const { movements, skipped, error } = csvToMovements(text);
    if (error || movements.length === 0) {
      toast.error(error ?? "No encontramos movimientos válidos en el archivo");
      return;
    }
    setPreview({ name: file.name, movements, skipped });
  }

  function confirmImport() {
    if (!preview) return;
    startTransition(async () => {
      try {
        let imported = 0;
        let duplicates = 0;
        for (let i = 0; i < preview.movements.length; i += CHUNK) {
          const r = await importMovements(preview.movements.slice(i, i + CHUNK));
          imported += r.imported;
          duplicates += r.duplicates;
        }
        toast.success(
          `Importamos ${imported} movimiento${imported === 1 ? "" : "s"}` +
            (duplicates ? ` (salteamos ${duplicates} que ya estaban)` : "")
        );
        setPreview(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo importar");
      }
    });
  }

  const income = preview?.movements.filter((m) => m.type === "income").length ?? 0;
  const expenses = (preview?.movements.length ?? 0) - income;
  const dates = preview?.movements.map((m) => m.occurred_at).sort() ?? [];
  const accounts = [...new Set(preview?.movements.map((m) => m.account) ?? [])];
  const total = preview?.movements.reduce((s, m) => s + (m.type === "expense" ? m.amount : 0), 0) ?? 0;

  return (
    <>
      <Button variant="outline" size="sm" nativeButton={false} render={<a href="/dashboard/export" download />}>
        <Download className="size-4" />
        Exportar
      </Button>
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <Upload className="size-4" />
        Importar
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <Dialog open={!!preview} onOpenChange={(open) => !open && !pending && setPreview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar movimientos</DialogTitle>
            <DialogDescription>
              Revisá que esté bien antes de cargarlo. Si algún movimiento ya existe, no se duplica.
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="font-medium">{preview.name}</p>
              <p>
                {preview.movements.length} movimientos: {expenses} gastos y {income} ingresos
              </p>
              <p className="text-muted-foreground">
                Del {formatDate(dates[0])} al {formatDate(dates.at(-1)!)} · Gastos por {formatCurrency(total)}
              </p>
              <p className="text-muted-foreground">
                Cuentas: {accounts.join(", ")}
                <span className="block text-xs">Las que no existan se crean solas.</span>
              </p>
              {preview.skipped > 0 && (
                <p className="text-xs text-destructive">
                  {preview.skipped} fila{preview.skipped === 1 ? "" : "s"} sin fecha o monto válido se van a saltear.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" disabled={pending} onClick={() => setPreview(null)}>
              Cancelar
            </Button>
            <Button disabled={pending} onClick={confirmImport}>
              {pending ? "Importando..." : "Importar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
