"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { categoryOpacity, categoryShade } from "@/lib/palette";

export interface CategorySlice {
  name: string;
  value: number;
  color: string;
}

export function SpendingByCategoryChart({ data: raw }: { data: CategorySlice[] }) {
  // Biggest category in the full accent, the rest in lighter shades of it.
  const data = raw
    .slice()
    .sort((a, b) => b.value - a.value)
    .map((d, i, all) => ({ ...d, color: categoryShade(i, all.length), opacity: categoryOpacity(i, all.length) }));
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay gastos este mes todavía.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <ResponsiveContainer width="100%" height={220} className="sm:max-w-[220px]">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            stroke="var(--card)"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill="var(--primary)" fillOpacity={entry.opacity} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-1 flex-col gap-2">
        {data
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((entry) => (
            <div key={entry.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
