"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red button and trash icon, for deletes. Defaults to true. */
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * App-styled replacement for window.confirm. Wrap the app once, then:
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title: "¿Eliminar?" }))) return;
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    resolver.current?.(false);
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  function finish(value: boolean) {
    resolver.current?.(value);
    resolver.current = null;
    setOpen(false);
  }

  const destructive = options?.destructive ?? true;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={open} onOpenChange={(next) => !next && finish(false)}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader className="items-center text-center sm:items-center sm:text-center">
            {destructive && (
              <span className="mb-1 grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </span>
            )}
            <DialogTitle className="font-heading text-lg">{options?.title}</DialogTitle>
            {options?.description && (
              <DialogDescription className="text-center">{options.description}</DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter className="mt-2 grid grid-cols-2 gap-2 sm:flex-none">
            <Button variant="outline" onClick={() => finish(false)}>
              {options?.cancelLabel ?? "Cancelar"}
            </Button>
            <Button
              className={destructive ? "bg-destructive text-white hover:bg-destructive/90" : undefined}
              onClick={() => finish(true)}
              autoFocus
            >
              {options?.confirmLabel ?? (destructive ? "Eliminar" : "Aceptar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  // Outside the provider, fall back to the browser's dialog rather than break.
  return confirm ?? (async (o) => window.confirm(o.description ? `${o.title}\n\n${o.description}` : o.title));
}
