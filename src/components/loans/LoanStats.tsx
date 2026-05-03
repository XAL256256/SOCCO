"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";

interface LoanStatsProps {
  outstanding: number;
  pending: number;
  activeDisbursements: number;
}

export function LoanStats({ outstanding, pending, activeDisbursements }: LoanStatsProps) {
  const items = [
    { label: "Outstanding Balance", value: outstanding,         prefix: "UGX", color: "#7C611C" },
    { label: "Pending Approval",    value: pending,             prefix: "UGX", color: "#B91C1C" },
    { label: "Active Disbursements",value: activeDisbursements, prefix: "",    color: "#1F6A40" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          className="bg-surface border border-line rounded-[4px] p-4 relative overflow-hidden group hover:border-line-h transition-colors duration-200"
        >
          <div
            className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
          />
          <p className="font-mono text-[9px] text-dim tracking-[0.12em] uppercase mb-2">
            {item.label}
          </p>
          <div className="flex items-baseline gap-1">
            {item.prefix && (
              <span className="font-mono text-sub text-xs">{item.prefix}</span>
            )}
            <span className="font-syne text-2xl font-bold" style={{ color: item.color }}>
              <CountUp end={item.value} duration={1.6} separator="," useEasing />
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
