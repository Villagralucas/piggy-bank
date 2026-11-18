"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

export interface CategorySlice {
  name: string;
  value: number;
  color: string;
}

export function SpendingByCategoryChart({ data }: { data: CategorySlice[] }) {
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
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
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
