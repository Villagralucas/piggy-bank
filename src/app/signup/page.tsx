"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthShell } from "@/components/auth-shell";
import { ShieldCheck, Sparkles } from "lucide-react";

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
    <AuthShell
      eyebrow="Empezá simple"
      title="Creá tu espacio y empezá a medir tu progreso."
      description="Registrá cuentas, movimientos y metas de ahorro con una interfaz pensada para el día a día."
      features={[{ icon: ShieldCheck, text: "Tus datos son solo tuyos, protegidos por usuario." }, { icon: Sparkles, text: "Categorías iniciales listas para usar." }]}
    >
        <Card className="w-full max-w-md rounded-2xl border-white/10 bg-card/95 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-3">
            <CardTitle className="font-heading text-3xl">Crear cuenta</CardTitle>
            <CardDescription>
              Empezá a controlar tus gastos y ahorros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <p className="text-sm">
                Revisá tu correo para confirmar tu cuenta y después iniciá
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
                  <PasswordInput
                    id="password"
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
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Iniciá sesión
              </Link>
            </p>
          </CardContent>
        </Card>
    </AuthShell>
  );
}
