"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactNumber, formatUGX } from "@/lib/utils";

type Datum = { month: string; amount: number; savings: number; welfare: number };

export function CollectionsChart({ data }: { data: Datum[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="amt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec5a2e" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#ec5a2e" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="sv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#16a34a" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f5f5f4" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#a8a29e"
            tickLine={false}
            axisLine={false}
            tick={{ fontFamily: "var(--font-body)", fontSize: 12 }}
          />
          <YAxis
            stroke="#a8a29e"
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => compactNumber(v)}
            tick={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
            width={48}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c1917",
              border: "none",
              borderRadius: "16px",
              fontFamily: "var(--font-body)",
              padding: "12px 14px",
              color: "#fff",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)",
            }}
            labelStyle={{ color: "#fef4ee", fontWeight: 700 }}
            formatter={(value: number, name) => [formatUGX(value), name]}
          />
          <Area
            type="monotone"
            dataKey="amount"
            name="Total"
            stroke="#ec5a2e"
            strokeWidth={3}
            fill="url(#amt)"
            activeDot={{ r: 6, strokeWidth: 0, fill: "#ec5a2e" }}
          />
          <Area
            type="monotone"
            dataKey="savings"
            name="Savings"
            stroke="#16a34a"
            strokeWidth={2.5}
            fill="url(#sv)"
            activeDot={{ r: 5, strokeWidth: 0, fill: "#16a34a" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
