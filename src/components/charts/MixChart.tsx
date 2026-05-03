"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatUGX } from "@/lib/utils";

type Datum = { name: string; value: number; color: string };

export function MixChart({ data }: { data: Datum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="relative h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c1917",
              border: "none",
              borderRadius: "12px",
              fontFamily: "var(--font-body)",
              padding: "10px 14px",
              color: "#fff",
            }}
            formatter={(v: number) => formatUGX(v)}
          />
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={92}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
            Total
          </p>
          <p className="font-display font-bold text-xl">{formatUGX(total)}</p>
        </div>
      </div>
    </div>
  );
}
