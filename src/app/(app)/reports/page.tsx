import {
  ArrowUpRight,
  BarChart3,
  Coins,
  FileSpreadsheet,
  HandCoins,
  PiggyBank,
  ScrollText,
  Wallet2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const REPORTS = [
  {
    href: "/reports/collections",
    title: "Monthly Collections",
    desc: "Member × Repayments / Savings / Welfare / Charges / Fees with totals — matches the NBOOG monthly collection sheet.",
    icon: FileSpreadsheet,
    tint: "from-primary-500 to-primary-600 text-white",
  },
  {
    href: "/reports/savings",
    title: "Savings Ledger",
    desc: "Annual savings matrix per member, with running totals across the months.",
    icon: PiggyBank,
    tint: "from-secondary-500 to-secondary-600 text-white",
  },
  {
    href: "/reports/welfare",
    title: "Welfare Report",
    desc: "Annual welfare matrix with arrears column (expected vs paid).",
    icon: HandCoins,
    tint: "from-accent-500 to-accent-600 text-gray-900",
  },
  {
    href: "/reports/borrowings",
    title: "Borrowings",
    desc: "Loans disbursed per member per month, with totals.",
    icon: Wallet2,
    tint: "from-info to-secondary-500 text-white",
  },
  {
    href: "/reports/repayments",
    title: "Repayments",
    desc: "Loan repayments by month per member.",
    icon: Coins,
    tint: "from-gray-700 to-gray-900 text-white",
  },
  {
    href: "/reports/loans",
    title: "Loan Applications",
    desc: "Applications grouped by month with requested vs approved amounts.",
    icon: ScrollText,
    tint: "from-primary-700 to-accent-600 text-white",
  },
  {
    href: "/reports/insights",
    title: "Performance Insights",
    desc: "Visual six-month trend and contribution mix charts.",
    icon: BarChart3,
    tint: "from-secondary-700 to-secondary-500 text-white",
  },
];

export default async function ReportsLanding() {
  await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-primary-600">
          {format(new Date(), "PPPP")}
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Reports
        </h1>
        <p className="mt-1 text-sm text-gray-500 max-w-2xl">
          Every report below maps to a sheet your treasurer used to assemble in
          Excel. Each is printable as PDF and exportable as CSV.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <Link
              key={r.href}
              href={r.href}
              className="group relative overflow-hidden rounded-[28px] bg-white p-6 shadow-elevated transition-all hover:-translate-y-1 hover:shadow-floating"
            >
              <div
                className={`mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${r.tint}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-display text-lg font-bold tracking-tight">
                {r.title}
              </h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{r.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                Open report
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
