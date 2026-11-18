"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ email, demo }: { email: string | null; demo: boolean }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const initial = demo ? "D" : (email?.trim()[0] ?? "?").toUpperCase();

  async function handleSignOut() {
    if (demo) {
      window.location.href = "/demo/salir";
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Abrir menú de usuario"
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary font-heading text-sm font-semibold text-primary-foreground">
            {initial}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-2">
            <span className="block text-xs text-muted-foreground">
              {demo ? "Estás en la demo" : "Sesión iniciada como"}
            </span>
            <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
              {demo ? "Datos de ejemplo" : email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="px-2 py-1.5"
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          {isDark ? "Tema claro" : "Tema oscuro"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="px-2 py-1.5" onClick={handleSignOut}>
          <LogOut aria-hidden="true" />
          {demo ? "Salir de la demo" : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
