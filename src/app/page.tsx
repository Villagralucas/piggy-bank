import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ChartPie,
  Check,
  Eye,
  Landmark,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/reveal";
import { DashboardPreview } from "@/components/dashboard-preview";
import heroImage from "../../public/auth-fondo.jpg";
import ctaImage from "../../public/landing-cta.jpg";

const FEATURES = [
  {
    icon: ReceiptText,
    title: "Movimientos",
    text: "Cargá ingresos y gastos en segundos y encontralos cuando los necesites.",
    points: [
      "Categoría, cuenta y fecha",
      "Filtros por tipo y búsqueda",
      "Borrado de a uno o en lote",
    ],
  },
  {
    icon: Landmark,
    title: "Cuentas",
    text: "Efectivo, banco, tarjeta o ahorro, cada una con su propio saldo.",
    points: [
      "Saldo que se actualiza solo",
      "Saldo inicial al crearla",
      "Total disponible en el resumen",
    ],
  },
  {
    icon: Target,
    title: "Metas de ahorro",
    text: "Ponele nombre y monto a lo que querés lograr y seguí cómo avanza.",
    points: [
      "Barra de progreso",
      "Aportes cuando quieras",
      "Fecha objetivo opcional",
    ],
  },
  {
    icon: ChartPie,
    title: "Reportes",
    text: "Mirá dónde se va la plata y cómo venís mes a mes.",
    points: [
      "Gastos por categoría",
      "Ingresos vs. gastos, 6 meses",
      "Gráficos claros y simples",
    ],
  },
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
    <div className="h-svh snap-y snap-mandatory overflow-y-auto bg-background">
      {/* HERO */}
      <section className="dark relative isolate flex min-h-svh snap-start flex-col overflow-hidden bg-zinc-950 text-white">
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

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <PiggyBank className="size-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-lg font-semibold">
              Piggy Bank
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Iniciar sesión
            </Button>
            <Button nativeButton={false} render={<Link href="/signup" />}>
              Crear cuenta
            </Button>
          </nav>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pb-20 lg:px-8">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Gratis y privado: tus datos son solo tuyos
          </p>
          <h1 className="mt-6 max-w-3xl font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Tus gastos, tus cuentas y tu ahorro,{" "}
            <span className="text-emerald-300">claros en un solo lugar.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
            Piggy Bank te muestra cuánto entra, cuánto sale y cuánto te queda.
            Sin planillas ni fórmulas rotas, desde la compu o el celular.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 px-6 text-base"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              Empezar gratis
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/25 bg-white/5 px-6 text-base text-white hover:bg-white/15 hover:text-white"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Ya tengo cuenta
            </Button>
          </div>
          <a
            href="/demo"
            className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
          >
            <Eye className="size-4" aria-hidden="true" />
            Ver una demo del tablero, sin registrarte
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="funciones"
        className="flex min-h-svh snap-start items-center"
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-8">
          <div>
            <Reveal>
              <p className="finance-label">Qué incluye</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Todo lo que necesitás para ordenar tu plata, nada que no.
              </h2>
            </Reveal>
            <Reveal delay={500}>
              <figure className="mt-10 border-l-4 border-primary pl-6 sm:mt-14">
                <blockquote className="font-heading text-xl leading-snug sm:text-2xl lg:text-[1.75rem]">
                  “No ahorres lo que te queda después de gastar; gastá lo que te
                  queda después de ahorrar.”
                </blockquote>
                <figcaption className="mt-4 text-base text-muted-foreground">
                  Warren Buffett
                </figcaption>
              </figure>
            </Reveal>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {FEATURES.map(({ icon: Icon, title, text, points }, i) => (
              <Reveal key={title} delay={900 + i * 300} className="h-full">
                <div className="finance-card h-full rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-heading text-lg font-semibold">
                      {title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                  <ul className="mt-4 hidden gap-2 text-sm sm:grid">
                    {points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <Check
                          className="size-4 shrink-0 text-success"
                          aria-hidden="true"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="dark relative isolate flex min-h-svh snap-start flex-col overflow-hidden bg-zinc-950 text-white">
        <Image
          src={ctaImage}
          alt=""
          fill
          placeholder="blur"
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-zinc-950/70" />
        <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-16 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16 lg:px-8">
          <Reveal className="order-2 lg:order-1">
            <DashboardPreview />
          </Reveal>
          <Reveal delay={300} className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Así se ve por dentro
            </p>
            <h2 className="mt-4 font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Tomá el control de tu mes.
            </h2>
            <p className="mt-4 max-w-sm text-white/75">
              Creá tu cuenta gratis y cargá tu primer movimiento hoy.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button
                size="lg"
                className="h-12 px-6 text-base"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Crear cuenta
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/25 bg-white/5 px-6 text-base text-white hover:bg-white/15 hover:text-white"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Iniciar sesión
              </Button>
            </div>
          </Reveal>
        </div>
        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-white/60 sm:flex-row lg:px-8">
            <span className="flex items-center gap-2">
              <PiggyBank className="size-4" aria-hidden="true" />
              Piggy Bank
            </span>
            <span>Hecho para ordenar tus finanzas personales.</span>
          </div>
        </footer>
      </section>
    </div>
  );
}
