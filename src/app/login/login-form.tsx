"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Eye, PiggyBank, ShieldCheck, Sparkles } from "lucide-react";

export function LoginForm({ initialError }: { initialError?: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
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
    <AuthShell
      eyebrow="Finanzas con foco"
      title="Ordená tus cuentas, gastos y metas con una vista clara."
      description="Una forma simple y privada de saber cuánto entra, cuánto sale y cuánto te queda."
      features={[{ icon: ShieldCheck, text: "Tus datos son solo tuyos, protegidos por usuario." }, { icon: Sparkles, text: "Movimientos, metas y reportes en un solo lugar." }]}
    >
        <Card className="w-full max-w-md rounded-3xl bg-card/95 shadow-2xl backdrop-blur-xl [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(9)]">
          <CardHeader className="justify-items-center gap-2 text-center">
            <span className="mb-2 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <PiggyBank className="size-6" aria-hidden="true" />
            </span>
            <CardTitle className="font-heading text-3xl tracking-tight">Iniciar sesión</CardTitle>
            <CardDescription>
              Entrá a tu gestor de gastos y ahorros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  className="h-11"
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
                  className="h-11"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading} className="mt-2 h-11 w-full text-base">
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿No tenés cuenta?{" "}
              <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                Registrate
              </Link>
            </p>
            <div className="mt-6 border-t pt-6">
              <Button
                variant="outline"
                className="h-11 w-full"
                nativeButton={false}
                render={<a href="/demo" />}
              >
                <Eye className="size-4" aria-hidden="true" />
                Ver demo sin registrarme
              </Button>
            </div>
          </CardContent>
        </Card>
    </AuthShell>
  );
}
