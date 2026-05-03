"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-raised border border-line-h rounded-[4px] px-3 py-2 shadow-xl">
      <p className="font-mono text-[10px] text-dim tracking-widest uppercase mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="font-mono text-xs text-sub">{entry.name}</span>
          <span className="font-mono text-xs text-txt ml-2">
            UGX {(entry.value as number)?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-raised border border-line-h rounded-[4px] px-3 py-2 shadow-xl">
      <p className="font-mono text-xs text-txt">{payload[0].name}</p>
      <p className="font-mono text-xs text-sub">
        UGX {(payload[0].value as number)?.toLocaleString()}
      </p>
    </div>
  );
};

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <div className="relative w-16 h-16">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-line"
            animate={{ scale: [1, 1.4 + i * 0.2], opacity: [0.4, 0] }}
            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
        <div className="absolute inset-0 rounded-full border border-gold-bd flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-gold opacity-40" />
        </div>
      </div>
      <p className="font-mono text-[10px] text-dim tracking-widest uppercase">{label}</p>
    </div>
  );
}

interface CollectionsChartProps {
  monthlyData: Array<{ month: string; amount: number; savings: number; welfare: number }>;
  mixData: Array<{ name: string; value: number; color: string }>;
}

export function CollectionsChart({ monthlyData, mixData }: CollectionsChartProps) {
  const totalMix = mixData.reduce((s, d) => s + d.value, 0);
  const mixPct = mixData.map((d) => ({
    ...d,
    pct: totalMix > 0 ? (d.value / totalMix) * 100 : 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-3">
      {/* Area chart — 8 cols */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="lg:col-span-8 bg-surface border border-line rounded-[4px] p-5"
      >
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <p className="font-mono text-[10px] text-dim tracking-[0.12em] uppercase mb-0.5">
              Monthly Collections
            </p>
            <p className="font-dm text-sub text-xs">Last six months · contributions vs savings</p>
          </div>
          <div className="flex items-center gap-4">
            {[
              { color: "#7C611C", label: "Total" },
              { color: "#1F6A40", label: "Savings" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-mono text-[10px] text-sub tracking-widest uppercase">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-52">
          {monthlyData.some((d) => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C611C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7C611C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F6A40" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1F6A40" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#E2DDD2"
                  strokeDasharray="1 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#75695B", fontSize: 10, fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#75695B", fontSize: 10, fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v === 0 ? "0" : `${(v / 1_000).toFixed(0)}k`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Total"
                  stroke="#7C611C"
                  strokeWidth={2}
                  fill="url(#goldGrad)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  name="Savings"
                  stroke="#1F6A40"
                  strokeWidth={1.5}
                  fill="url(#greenGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No collections yet" />
          )}
        </div>
      </motion.div>

      {/* Pie — 4 cols */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="lg:col-span-4 bg-surface border border-line rounded-[4px] p-5"
      >
        <p className="font-mono text-[10px] text-dim tracking-[0.12em] uppercase mb-0.5">
          Contribution Mix
        </p>
        <p className="font-dm text-sub text-xs mb-5">All-time category split</p>

        <div className="h-44 flex items-center justify-center">
          {mixPct.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mixPct}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {mixPct.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No data yet" />
          )}
        </div>

        {mixPct.length > 0 && (
          <div className="space-y-2 mt-2">
            {mixPct.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-dm text-xs text-sub">{item.name}</span>
                </div>
                <span className="font-mono text-xs text-txt">{item.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
