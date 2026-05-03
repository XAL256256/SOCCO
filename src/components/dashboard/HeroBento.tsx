"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Coins,
  HandCoins,
  PiggyBank,
  Receipt,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { StatBadge } from "@/components/ui/StatBadge";
import type { DashboardStats } from "@/lib/dashboard";

type Props = { stats: DashboardStats; userName: string };

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function HeroBento({ stats, userName }: Props) {
  const presentPct = stats.totalMembers
    ? (stats.membersPresentToday / stats.totalMembers) * 100
    : 0;

  return (
    <motion.section variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={item} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary-600">
            {new Date().toLocaleDateString("en-UG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Welcome back,
            <br />
            <span className="text-gradient-warm">{userName.split(" ")[0]}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
            Here&apos;s what&apos;s happening with NBOOG SACCO today.
          </p>
        </div>
        <Link
          href="/contributions/new"
          className="btn-primary inline-flex"
        >
          Log a contribution
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-12 gap-4 sm:gap-5">
        {/* Headliner: Total Collections */}
        <motion.div
          variants={item}
          className="relative col-span-12 overflow-hidden rounded-[32px] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 text-white shadow-floating sm:p-8 lg:col-span-7"
        >
          <div aria-hidden className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="dots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
                  <circle cx="18" cy="18" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          <motion.div
            aria-hidden
            className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-widest text-primary-100">
              Total Collections (all-time)
            </p>
            <div className="mt-3 font-mono text-4xl font-bold leading-none sm:text-5xl lg:text-6xl">
              <AnimatedNumber value={stats.totalCollections} prefix="UGX" duration={1800} />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <StatBadge
                delta={stats.collectionDelta}
                label="vs last month"
                className="bg-white/15 text-white"
              />
              <span className="text-xs text-primary-100">
                {stats.receiptsToday} receipt{stats.receiptsToday === 1 ? "" : "s"} today
              </span>
            </div>
          </div>
        </motion.div>

        {/* Members present today */}
        <motion.div
          variants={item}
          className="col-span-12 rounded-[32px] bg-white p-6 shadow-elevated sm:p-7 lg:col-span-5"
        >
          <div className="flex items-start justify-between">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
              Members present today
            </p>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-100 text-secondary-700">
              <Users2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-end gap-3">
            <span className="font-display text-5xl font-bold text-secondary-700">
              <AnimatedNumber value={stats.membersPresentToday} duration={1200} />
            </span>
            <span className="mb-1 text-xl text-gray-400">
              / {stats.totalMembers}
            </span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${presentPct}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-secondary-400 to-secondary-600"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {presentPct.toFixed(0)}% turnout
          </p>
        </motion.div>

        {/* Savings */}
        <motion.div
          variants={item}
          className="col-span-12 rounded-[32px] border-2 border-secondary-200 bg-secondary-50 p-6 sm:p-7 sm:col-span-6 lg:col-span-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-secondary-700">
                Savings
              </p>
              <div className="mt-3 font-mono text-2xl font-bold text-secondary-900 sm:text-3xl">
                <AnimatedNumber value={stats.totalSavings} prefix="UGX" />
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-200 text-secondary-700">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-secondary-700">
            Growing the future, one shilling at a time.
          </p>
        </motion.div>

        {/* Welfare */}
        <motion.div
          variants={item}
          className="col-span-12 rounded-[32px] border-2 border-primary-200 bg-primary-50 p-6 sm:p-7 sm:col-span-6 lg:col-span-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-primary-700">
                Welfare
              </p>
              <div className="mt-3 font-mono text-2xl font-bold text-primary-900 sm:text-3xl">
                <AnimatedNumber value={stats.totalWelfare} prefix="UGX" />
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-200 text-primary-700">
              <HandCoins className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-primary-700">
            Caring for one another, every meeting.
          </p>
        </motion.div>

        {/* Loan Repayment */}
        <motion.div
          variants={item}
          className="col-span-12 rounded-[32px] border-2 border-accent-200 bg-accent-50 p-6 sm:p-7 lg:col-span-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-accent-800">
                Loan repayments
              </p>
              <div className="mt-3 font-mono text-2xl font-bold text-accent-900 sm:text-3xl">
                <AnimatedNumber value={stats.totalLoanRepayment} prefix="UGX" />
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent-200 text-accent-800">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-accent-800">
            Members repaying — building credit history.
          </p>
        </motion.div>

        {/* Receipts today */}
        <motion.div
          variants={item}
          className="col-span-12 rounded-[32px] bg-gray-900 p-6 text-white sm:p-7 lg:col-span-12"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-gray-400">
                  Active members · Receipts today
                </p>
                <p className="mt-1 font-display text-2xl font-bold">
                  {stats.activeMembers} active · {stats.receiptsToday} receipts issued
                </p>
              </div>
            </div>
            <Link
              href="/receipts"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              View receipts
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
