"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Pause, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteRecurring, setRecurringActive } from "@/app/dashboard/recurring/actions";

export function RecurringActions({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      try {
        await setRecurringActive(id, !active);
        toast.success(active ? "Pausado" : "Reanudado");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo actualizar");
      }
    });
  }

  function remove() {
    if (!window.confirm("¿Eliminar este fijo? Los movimientos que ya se cargaron quedan.")) return;
    startTransition(async () => {
      try {
        await deleteRecurring(id);
        toast.success("Eliminado");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggle}
        disabled={pending}
        title={active ? "Pausar" : "Reanudar"}
        aria-label={active ? "Pausar" : "Reanudar"}
      >
        {active ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-destructive"
        onClick={remove}
        disabled={pending}
        aria-label="Eliminar"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
