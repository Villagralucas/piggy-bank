import { PiggyBank, Scale, TrendingDown, TrendingUp } from "lucide-react";

/**
 * Static thumbnail of the dashboard for the landing page.
 * Pure markup with sample numbers — it never reads real data.
 */
export function DashboardPreview() {
  const stats = [
    {
      icon: Scale,
      label: "Balance del mes",
      value: "$ 71.000",
      tone: "text-success",
    },
    { icon: TrendingUp, label: "Ingresos", value: "$ 420.000", tone: "" },
    {
      icon: TrendingDown,
      label: "Gastos",
      value: "$ 349.000",
      tone: "",
      bar: 23,
    },
    { icon: PiggyBank, label: "Ahorro", value: "$ 1.050.000", tone: "" },
  ];
  const categories = [
    { name: "Comida", value: "$ 101.000", width: 100, color: "#f97316" },
    { name: "Entretenimiento", value: "$ 95.000", width: 94, color: "#ec4899" },
    { name: "Transporte", value: "$ 58.000", width: 57, color: "#0ea5e9" },
    { name: "Salud", value: "$ 50.000", width: 50, color: "#ef4444" },
  ];

  return (
    <div
      aria-hidden="true"
      className="w-full overflow-hidden rounded-2xl border border-white/10 bg-background/90 text-foreground shadow-2xl shadow-black/50 backdrop-blur-md"
    >
      {/* window bar */}
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-white/20" />
        <span className="size-2.5 rounded-full bg-white/20" />
        <span className="size-2.5 rounded-full bg-white/20" />
        <span className="ml-3 truncate rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground">
          piggy-bank · Resumen
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Resumen de noviembre
            </p>
            <p className="mt-1 font-heading text-xl font-semibold">
              $ 3.585.000
            </p>
          </div>
          <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
            + Agregar movimiento
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map(({ icon: Icon, label, value, tone, bar }) => (
            <div
              key={label}
              className="rounded-lg border border-white/10 bg-card p-2.5"
            >
              <p className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <Icon className="size-2.5" />
                {label}
              </p>
              <p className={`mt-1 font-heading text-sm font-semibold ${tone}`}>
                {value}
              </p>
              {bar !== undefined && (
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${bar}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-5">
          <div className="rounded-lg border border-white/10 bg-card p-2.5 sm:col-span-3">
            <p className="text-[10px] font-semibold">Ingresos y gastos</p>
            <svg
              viewBox="0 0 200 70"
              className="mt-2 h-20 w-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pv-in" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--success)"
                    stopOpacity="0.35"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--success)"
                    stopOpacity="0"
                  />
                </linearGradient>
                <linearGradient id="pv-out" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--destructive)"
                    stopOpacity="0.3"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--destructive)"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <path
                d="M0 52 C30 40 50 22 80 20 S130 14 160 12 S190 30 200 34 L200 70 L0 70 Z"
                fill="url(#pv-in)"
              />
              <path
                d="M0 52 C30 40 50 22 80 20 S130 14 160 12 S190 30 200 34"
                fill="none"
                stroke="var(--success)"
                strokeWidth="1.5"
              />
              <path
                d="M0 60 C30 54 50 42 80 40 S130 36 160 34 S190 46 200 50 L200 70 L0 70 Z"
                fill="url(#pv-out)"
              />
              <path
                d="M0 60 C30 54 50 42 80 40 S130 36 160 34 S190 46 200 50"
                fill="none"
                stroke="var(--destructive)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="rounded-lg border border-white/10 bg-card p-2.5 sm:col-span-2">
            <p className="text-[10px] font-semibold">Gastos por categoría</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {categories.map((c) => (
                <li key={c.name}>
                  <div className="flex justify-between text-[9px]">
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">{c.value}</span>
                  </div>
                  <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${c.width}%`, backgroundColor: c.color }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
