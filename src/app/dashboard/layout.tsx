import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import { PiggyBank } from "lucide-react";

const NAV_ITEMS: { href: Route; label: string }[] = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/transactions", label: "Movimientos" },
  { href: "/dashboard/accounts", label: "Cuentas" },
  { href: "/dashboard/goals", label: "Metas de ahorro" },
  { href: "/dashboard/reports", label: "Reportes" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userEmail: string | null = null;

  if (!DEMO_MODE) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    userEmail = user.email ?? null;
  }

  return (
    <div className="finance-shell">
      {DEMO_MODE && (
        <div className="border-b bg-secondary px-4 py-2 text-center text-sm font-medium text-secondary-foreground">
          Modo demo - datos de ejemplo
        </div>
      )}
      <header className="sticky top-0 z-30 border-b bg-background/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <PiggyBank className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-heading text-lg font-semibold leading-none tracking-tight">
                  Piggy Bank
                </span>
                <span className="mt-1 block text-xs font-medium text-muted-foreground">
                  Finanzas personales
                </span>
              </span>
            </Link>
            <nav className="hidden rounded-full border bg-card/70 p-1 shadow-sm sm:flex">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate rounded-full border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground sm:inline">
              {DEMO_MODE ? "Modo demo" : userEmail}
            </span>
            <ThemeToggle />
            {!DEMO_MODE && <SignOutButton />}
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t px-4 py-3 sm:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full border bg-card/70 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">{children}</main>
      <Toaster />
    </div>
  );
}
