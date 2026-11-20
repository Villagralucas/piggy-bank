"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

export const QUICK_ADD_EVENT = "pb:quick-add";

/**
 * Floating "+" on phones: always one tap away from logging an expense.
 * On the Resumen page it opens the form in place; elsewhere it goes there.
 */
export function QuickAddButton() {
  const pathname = usePathname();
  return (
    <Link
      href="/dashboard?nuevo=gasto"
      aria-label="Cargar gasto"
      onClick={(e) => {
        if (pathname === "/dashboard") {
          e.preventDefault();
          window.dispatchEvent(new Event(QUICK_ADD_EVENT));
        }
      }}
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/25 transition-transform active:scale-95 md:hidden"
    >
      <Plus className="size-6" />
    </Link>
  );
}
