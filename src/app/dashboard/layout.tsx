import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE, isDemo } from "@/lib/demo-mode";
import { Toaster } from "@/components/ui/sonner";
import { DashboardNav } from "@/components/dashboard-nav";
import { UserMenu } from "@/components/user-menu";
import { PiggyBank } from "lucide-react";
import { QuickAddButton } from "@/components/quick-add-button";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userEmail: string | null = null;
  const demo = await isDemo();

  if (!demo) {
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
      {demo && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">
          <span>Estás viendo una demo con datos de ejemplo.</span>
          {!DEMO_MODE && (
            <span className="flex gap-3">
              <a href="/demo/salir?to=signup" className="underline underline-offset-4">
                Crear mi cuenta
              </a>
              <a href="/demo/salir" className="underline underline-offset-4 opacity-80">
                Salir de la demo
              </a>
            </span>
          )}
        </div>
      )}
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 sm:px-6 md:grid-cols-[1fr_auto_1fr] lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3 justify-self-start">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <PiggyBank className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-heading text-lg font-semibold leading-none tracking-tight">
                Piggy Bank
              </span>
              <span className="mt-1 hidden text-xs font-medium text-muted-foreground sm:block">
                Finanzas personales
              </span>
            </span>
          </Link>
          <DashboardNav variant="desktop" />
          <div className="justify-self-end">
            <UserMenu email={userEmail} demo={demo} />
          </div>
        </div>
        <DashboardNav variant="mobile" />
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-24 md:py-8">{children}</main>
      <QuickAddButton />
      <Toaster />
    </div>
  );
}
