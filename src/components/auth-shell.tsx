import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { PiggyBank } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import fondo from "../../public/auth-fondo.jpg";

type Feature = { icon: LucideIcon; text: string };

export function AuthShell({
  eyebrow,
  title,
  description,
  features,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  features: Feature[];
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-zinc-950">
      <Image
        src={fondo}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-950/55 via-zinc-950/35 to-zinc-950/80 lg:bg-gradient-to-br lg:from-zinc-950/90 lg:via-zinc-950/70 lg:to-emerald-950/60" />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="mx-auto grid min-h-screen max-w-6xl content-center items-center gap-10 px-4 py-16 lg:content-normal lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <section className="text-white">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
              <PiggyBank className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading text-xl font-semibold">Piggy Bank</p>
              <p className="text-sm text-white/60">Control financiero personal</p>
            </div>
          </div>

          <div className="mt-12 hidden max-w-xl lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-heading text-5xl font-semibold leading-tight tracking-tight">
              {title}
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/70">
              {description}
            </p>

            <ul className="mt-10 grid gap-3 text-sm text-white/80">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-lg bg-white/10 backdrop-blur">
                    <Icon className="size-4 text-emerald-300" aria-hidden="true" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">{children}</section>
      </div>
    </div>
  );
}
