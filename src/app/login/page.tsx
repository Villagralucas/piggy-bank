"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { PiggyBank, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative grid min-h-screen overflow-hidden p-4 lg:grid-cols-[1.05fr_0.95fr] lg:p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <section className="hidden content-between rounded-2xl border bg-zinc-950 p-8 text-white lg:grid">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <PiggyBank className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-heading text-xl font-semibold">Piggy Bank</p>
            <p className="text-sm text-white/55">Control financiero personal</p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">
            Finanzas con foco
          </p>
          <h1 className="mt-4 font-heading text-5xl font-semibold leading-tight tracking-tight">
            Ordena tus cuentas, gastos y metas con una vista clara.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/60">
            Una experiencia simple, moderna y privada para tomar mejores
            decisiones con tu dinero.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-white/70">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <ShieldCheck className="size-5 text-indigo-300" aria-hidden="true" />
            Tus datos se separan por usuario con Supabase.
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Sparkles className="size-5 text-indigo-300" aria-hidden="true" />
            Reportes, movimientos y metas en un solo lugar.
          </div>
        </div>
      </section>

      <section className="grid place-items-center px-0 py-12 lg:px-8">
        <Card className="finance-card w-full max-w-md rounded-[1.75rem]">
          <CardHeader className="space-y-3">
            <div className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground lg:hidden">
              <PiggyBank className="size-6" aria-hidden="true" />
            </div>
            <CardTitle className="font-heading text-3xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Entra a tu gestor de gastos y ahorros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading} className="mt-2 h-11 rounded-xl">
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                Regístrate
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
