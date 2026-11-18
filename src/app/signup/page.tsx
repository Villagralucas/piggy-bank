"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
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

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
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
            Empieza simple
          </p>
          <h1 className="mt-4 font-heading text-5xl font-semibold leading-tight tracking-tight">
            Crea tu espacio financiero y empieza a medir tu progreso.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/60">
            Registra cuentas, movimientos y metas con una interfaz clara,
            moderna y pensada para el día a día.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-white/70">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <ShieldCheck className="size-5 text-indigo-300" aria-hidden="true" />
            Seguridad por usuario con Supabase Auth.
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Sparkles className="size-5 text-indigo-300" aria-hidden="true" />
            Categorías iniciales listas para usar.
          </div>
        </div>
      </section>

      <section className="grid place-items-center px-0 py-12 lg:px-8">
        <Card className="finance-card w-full max-w-md rounded-[1.75rem]">
          <CardHeader className="space-y-3">
            <div className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground lg:hidden">
              <PiggyBank className="size-6" aria-hidden="true" />
            </div>
            <CardTitle className="font-heading text-3xl">Crear cuenta</CardTitle>
            <CardDescription>
              Empieza a controlar tus gastos y ahorros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <p className="text-sm">
                Revisa tu correo para confirmar tu cuenta y luego inicia
                sesión.
              </p>
            ) : (
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
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={loading} className="mt-2 h-11 rounded-xl">
                  {loading ? "Creando..." : "Crear cuenta"}
                </Button>
              </form>
            )}
            <p className="mt-4 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
