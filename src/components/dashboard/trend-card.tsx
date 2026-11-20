"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

export interface TrendPoint {
  month: string;
  Ingresos: number;
  Gastos: number;
}

const RANGES = [
  { value: "3", label: "3 meses" },
  { value: "6", label: "6 meses" },
  { value: "12", label: "12 meses" },
];

/** Income vs. expenses over the last N months. `data` holds the last 12 months, oldest first. */
export function TrendCard({ data }: { data: TrendPoint[] }) {
  const [range, setRange] = useState("6");
  const visible = data.slice(-Number(range));

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="finance-label">Tendencia</p>
          <h2 className="mt-1 font-heading text-xl font-semibold">Ingresos y gastos</h2>
          <p className="text-sm text-muted-foreground">Cómo venís mes a mes</p>
        </div>
        <Tabs value={range} onValueChange={(v) => setRange(String(v))}>
          <TabsList>
            {RANGES.map((r) => (
              <TabsTrigger key={r.value} value={r.value} className="px-3 text-xs">
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={visible} margin={{ left: 0, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillGastos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            fontSize={12}
            width={64}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCompactCurrency(Number(v))}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--popover-foreground)",
            }}
          />
          <Area
            type="monotone"
            dataKey="Ingresos"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#fillIngresos)"
          />
          <Area
            type="monotone"
            dataKey="Gastos"
            stroke="var(--chart-2)"
            strokeWidth={2}
            fill="url(#fillGastos)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" /> Ingresos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-chart-2" /> Gastos
        </span>
      </div>
    </div>
  );
}
