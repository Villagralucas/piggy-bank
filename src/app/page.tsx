import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ChartPie,
  Landmark,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import heroImage from "../../public/auth-fondo.jpg";
import ctaImage from "../../public/landing-cta.jpg";

const FEATURES = [
  {
    icon: ReceiptText,
    title: "Movimientos",
    text: "Cargá ingresos y gastos en segundos, con categoría, cuenta y fecha. Filtrá y ordená cuando quieras.",
  },
  {
    icon: Landmark,
    title: "Cuentas",
    text: "Efectivo, banco, tarjeta o ahorro: cada cuenta con su saldo actualizado solo.",
  },
  {
    icon: Target,
    title: "Metas de ahorro",
    text: "Ponele nombre y monto a lo que querés lograr y mirá cómo avanza la barra.",
  },
  {
    icon: ChartPie,
    title: "Reportes",
    text: "Dónde se va la plata por categoría y cómo venís mes a mes, en gráficos claros.",
  },
];

const STEPS = [
  { title: "Creá tu cuenta", text: "Solo mail y contraseña. Las categorías básicas ya vienen cargadas." },
  { title: "Sumá tus cuentas", text: "Agregá efectivo, banco o tarjeta con el saldo que tenés hoy." },
  { title: "Registrá y mirá", text: "Cargá tus movimientos y seguí tu mes desde el resumen." },
];

export default async function Home() {
  if (DEMO_MODE) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="dark relative isolate overflow-hidden bg-zinc-950 text-white">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="-z-20 object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-950/70 via-zinc-950/50 to-zinc-950/90 lg:bg-gradient-to-r lg:from-zinc-950/90 lg:via-zinc-950/65 lg:to-zinc-950/30" />

        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <PiggyBank className="size-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-lg font-semibold">Piggy Bank</span>
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex"
              nativeButton={false} render={<Link href="/login" />}
            >
              Iniciar sesión
            </Button>
            <Button nativeButton={false} render={<Link href="/signup" />}>Crear cuenta</Button>
          </nav>
        </header>

        <div className="mx-auto max-w-6xl px-4 pt-16 pb-24 lg:px-8 lg:pt-28 lg:pb-36">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Gratis y privado: tus datos son solo tuyos
          </p>
          <h1 className="mt-6 max-w-3xl font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Tus gastos, tus cuentas y tu ahorro,{" "}
            <span className="text-indigo-300">claros en un solo lugar.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
            Piggy Bank te muestra cuánto entra, cuánto sale y cuánto te queda.
            Sin planillas ni fórmulas rotas, desde la compu o el celular.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-6 text-base" nativeButton={false} render={<Link href="/signup" />}>
              Empezar gratis
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/25 bg-white/5 px-6 text-base text-white hover:bg-white/15 hover:text-white"
              nativeButton={false} render={<Link href="/login" />}
            >
              Ya tengo cuenta
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funciones" className="mx-auto max-w-6xl px-4 py-20 lg:px-8 lg:py-28">
        <p className="finance-label">Qué incluye</p>
        <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Todo lo que necesitás para ordenar tu plata, nada que no.
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="finance-card rounded-2xl p-6">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-heading text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section className="border-y bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="finance-label">Cómo funciona</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Empezás en menos de un minuto.
            </h2>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="size-4" aria-hidden="true" />
              Funciona en el navegador del celular y de la compu.
            </p>
          </div>
          <ol className="grid gap-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-heading font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl bg-zinc-950 px-6 py-16 text-center text-white sm:px-12">
          <Image
            src={ctaImage}
            alt=""
            fill
            placeholder="blur"
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="-z-20 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-zinc-950/70" />
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Tomá el control de tu mes.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/75">
            Creá tu cuenta gratis y cargá tu primer movimiento hoy.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-6 text-base" nativeButton={false} render={<Link href="/signup" />}>
              Crear cuenta
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/25 bg-white/5 px-6 text-base text-white hover:bg-white/15 hover:text-white"
              nativeButton={false} render={<Link href="/login" />}
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row lg:px-8">
          <span className="flex items-center gap-2">
            <PiggyBank className="size-4" aria-hidden="true" />
            Piggy Bank
          </span>
          <span>Hecho para ordenar tus finanzas personales.</span>
        </div>
      </footer>
    </div>
  );
}
