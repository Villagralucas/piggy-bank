"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteButton({
  id,
  action,
  confirmMessage = "¿Seguro que quieres eliminar esto?",
}: {
  id: string;
  action: (id: string) => Promise<void>;
  confirmMessage?: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      try {
        await action(id);
        toast.success("Eliminado");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-destructive"
      onClick={handleClick}
      disabled={pending}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
