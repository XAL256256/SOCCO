"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delta?: number;
  deltaLabel?: string;
  color?: "gold" | "growth" | "danger" | "default";
  index: number;
  subtext?: string;
}

function StatCard({
  label, value, prefix, suffix, delta, deltaLabel,
  color = "default", index, subtext,
}: StatCardProps) {
  const accents: Record<string, string> = {
    gold:    "#E8A838",
    growth:  "#2DC98A",
    danger:  "#E05454",
    default: "#8892A4",
  };
  const accent = accents[color];

  const DeltaIcon =
    delta == null ? null : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const deltaColor =
    delta == null ? "#8892A4" : delta > 0 ? "#2DC98A" : delta < 0 ? "#E05454" : "#8892A4";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-surface border border-line rounded-[4px] p-5 overflow-hidden group hover:border-line-h transition-colors duration-300"
    >
      {/* Hover top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] transition-all duration-300 opacity-0 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      {/* Radial glow */}
      <div
        className="absolute -top-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-25 transition-opacity duration-500"
        style={{ backgroundColor: accent }}
      />

      <div className="relative z-10">
        <p className="font-mono text-[10px] text-dim tracking-[0.12em] uppercase mb-3">{label}</p>
        <div className="flex items-end gap-1">
          {prefix && <span className="font-mono text-sub text-sm mb-1">{prefix}</span>}
          <span className="font-syne text-[2rem] leading-none font-bold" style={{ color: accent }}>
            <CountUp end={value} duration={1.8} separator="," useEasing />
          </span>
          {suffix && <span className="font-mono text-sub text-sm mb-1 ml-1">{suffix}</span>}
        </div>

        {delta != null && DeltaIcon && (
          <div className="flex items-center gap-1.5 mt-2">
            <DeltaIcon size={11} style={{ color: deltaColor }} />
            <span className="font-mono text-[10px]" style={{ color: deltaColor }}>
              {Math.abs(delta)}% {deltaLabel}
            </span>
          </div>
        )}
        {subtext && delta == null && (
          <p className="font-dm text-dim text-xs mt-2 leading-relaxed">{subtext}</p>
        )}
      </div>
    </motion.div>
  );
}

interface DashboardHeroProps {
  userName: string;
  saccoName: string;
  totalCollections: number;
  membersPresent: number;
  totalMembers: number;
  savings: number;
  welfare: number;
  loanRepayments: number;
  receiptsToday: number;
  activeMembers: number;
  collectionDelta: number;
}

export function DashboardHero({
  userName, saccoName, totalCollections, membersPresent,
  totalMembers, savings, welfare, loanRepayments,
  receiptsToday, activeMembers, collectionDelta,
}: DashboardHeroProps) {
  return (
    <div>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between mb-8 flex-wrap gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-dim tracking-[0.2em] uppercase">
              {new Date().toLocaleDateString("en-UG", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </span>
          </div>
          <h1 className="font-syne text-3xl font-bold text-txt">
            Welcome back, <span className="text-gold">{userName.split(" ")[0]}</span>
          </h1>
          <p className="font-dm text-sub text-sm mt-1">
            {saccoName} &middot; Here&apos;s the pulse today.
          </p>
        </div>

        <Link
          href="/contributions/new"
          className="btn-primary flex items-center gap-2 group"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform duration-200" />
          Log Contribution
        </Link>
      </motion.div>

      {/* Stats grid — row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard
          label="Total Collections"
          value={totalCollections}
          prefix="UGX"
          delta={Math.round(collectionDelta)}
          deltaLabel="vs last month"
          color="gold"
          index={0}
        />
        <StatCard
          label="Members Present"
          value={membersPresent}
          suffix={`/ ${totalMembers}`}
          subtext={`${totalMembers > 0 ? Math.round((membersPresent / totalMembers) * 100) : 0}% turnout`}
          color="growth"
          index={1}
        />
        <StatCard
          label="Savings Pool"
          value={savings}
          prefix="UGX"
          subtext="Growing the future, one shilling at a time."
          color="growth"
          index={2}
        />
        <StatCard
          label="Welfare Fund"
          value={welfare}
          prefix="UGX"
          subtext="Caring for one another, every meeting."
          color="default"
          index={3}
        />
      </div>

      {/* Stats grid — row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Loan Repayments"
          value={loanRepayments}
          prefix="UGX"
          subtext="Building credit history."
          color="default"
          index={4}
        />
        <StatCard
          label="Active Members"
          value={activeMembers}
          subtext={`${receiptsToday} receipt${receiptsToday === 1 ? "" : "s"} issued today`}
          color="default"
          index={5}
        />
      </div>
    </div>
  );
}
