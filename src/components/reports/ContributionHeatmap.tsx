"use client";

import { motion } from "framer-motion";
import { formatUGX } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  memberNumber: string;
  months: number[];
};

export function ContributionHeatmap({
  labels,
  rows,
}: {
  labels: string[];
  rows: Row[];
}) {
  const max = Math.max(1, ...rows.flatMap((r) => r.months));

  const heatColor = (v: number) => {
    if (v <= 0) return "#fafaf9";
    const i = v / max;
    if (i < 0.2) return "#fde8dc";
    if (i < 0.4) return "#fbcbb9";
    if (i < 0.6) return "#f8a987";
    if (i < 0.8) return "#f47d53";
    return "#ec5a2e";
  };

  return (
    <table className="min-w-full border-separate" style={{ borderSpacing: "4px" }}>
      <thead>
        <tr>
          <th className="sticky left-0 bg-white text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Member
          </th>
          {labels.map((l) => (
            <th
              key={l}
              className="text-center text-xs font-mono font-semibold text-gray-500 uppercase"
            >
              {l}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rIdx) => (
          <tr key={row.id}>
            <th className="sticky left-0 bg-white pr-4 text-left">
              <p className="text-sm font-semibold truncate max-w-[12rem]">
                {row.name}
              </p>
              <p className="font-mono text-[10px] text-gray-500">
                {row.memberNumber}
              </p>
            </th>
            {row.months.map((v, idx) => (
              <td key={idx} className="p-0">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: rIdx * 0.02 + idx * 0.02 }}
                  whileHover={{ scale: 1.18, zIndex: 5 }}
                  className="relative h-8 w-12 rounded-md cursor-pointer group"
                  style={{ backgroundColor: heatColor(v) }}
                  title={`${row.name}: ${formatUGX(v)}`}
                >
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
                    <span className="whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-xs text-white">
                      {formatUGX(v)}
                    </span>
                  </div>
                </motion.div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
