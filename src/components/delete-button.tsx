"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useConfirm } from "@/components/confirm-dialog";

export function DeleteButton({
  id,
  action,
  title = "¿Eliminar?",
  description,
}: {
  id: string;
  action: (id: string) => Promise<void>;
  title?: string;
  description?: string;
}) {
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();

  async function handleClick() {
    if (!(await confirm({ title, description }))) return;
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
      aria-label="Eliminar"
      onClick={handleClick}
      disabled={pending}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
