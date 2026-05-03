import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Receipt as ReceiptIcon,
  ShieldCheck,
  Wallet2,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/dashboard";
import { HeroBento } from "@/components/dashboard/HeroBento";
import { CollectionsChart } from "@/components/charts/CollectionsChart";
import { MixChart } from "@/components/charts/MixChart";
import { Avatar } from "@/components/ui/Avatar";
import { formatUGX } from "@/lib/utils";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const stats = await getDashboardStats();
  const isChair = user.role === "ADMIN" || user.role === "CHAIRPERSON";

  return (
    <div className="space-y-10">
      <HeroBento stats={stats} userName={user.fullName} />

      {/* Chairperson oversight strip */}
      {isChair && (stats.pendingLoanCount > 0 || stats.outstandingFineCount > 0 || stats.outstandingLoanTotal > 0) && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/approvals"
            className="group flex items-center gap-4 rounded-[24px] border-2 border-accent-200 bg-accent-50 p-5 transition-all hover:-translate-y-1"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-500 text-gray-900">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-mono text-xs uppercase tracking-widest text-accent-800">
                Pending approvals
              </p>
              <p className="font-mono text-xl font-bold">
                {stats.pendingLoanCount}{" "}
                <span className="text-sm font-normal opacity-70">loans</span>
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-accent-700 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/loans"
            className="group flex items-center gap-4 rounded-[24px] border-2 border-primary-200 bg-primary-50 p-5 transition-all hover:-translate-y-1"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-500 text-white">
              <Wallet2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-mono text-xs uppercase tracking-widest text-primary-800">
                Outstanding loans
              </p>
              <p className="font-mono text-xl font-bold text-primary-900">
                {formatUGX(stats.outstandingLoanTotal)}
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-primary-700 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/approvals"
            className="group flex items-center gap-4 rounded-[24px] border-2 border-secondary-200 bg-secondary-50 p-5 transition-all hover:-translate-y-1"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary-500 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-mono text-xs uppercase tracking-widest text-secondary-800">
                Outstanding fines
              </p>
              <p className="font-mono text-xl font-bold text-secondary-900">
                {stats.outstandingFineCount}
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-secondary-700 group-hover:translate-x-0.5" />
          </Link>
        </section>
      )}

      <section className="grid grid-cols-12 gap-5">
        <div className="col-span-12 rounded-[32px] bg-white p-6 shadow-elevated sm:p-7 lg:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gray-900">
                Monthly Collections
              </h2>
              <p className="text-sm text-gray-500">
                The last six months of contributions vs savings.
              </p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <span className="chip-primary">
                <span className="h-2 w-2 rounded-full bg-primary-500 inline-block" />
                Total
              </span>
              <span className="chip-secondary">
                <span className="h-2 w-2 rounded-full bg-secondary-500 inline-block" />
                Savings
              </span>
            </div>
          </div>
          <CollectionsChart data={stats.monthlyTrend} />
        </div>

        <div className="col-span-12 rounded-[32px] bg-white p-6 shadow-elevated sm:p-7 lg:col-span-4">
          <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gray-900">
            Contribution Mix
          </h2>
          <p className="text-sm text-gray-500">All-time category split.</p>
          {stats.contributionMix.length === 0 ? (
            <p className="mt-12 text-center text-sm text-gray-400">
              No contributions yet
            </p>
          ) : (
            <>
              <MixChart data={stats.contributionMix} />
              <ul className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {stats.contributionMix.map((s) => (
                  <li key={s.name} className="flex items-center gap-2 text-gray-700">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="truncate">{s.name}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-elevated sm:p-7">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gray-900">
              Recent Receipts
            </h2>
            <p className="text-sm text-gray-500">
              The latest financial movements across the SACCO.
            </p>
          </div>
          <Link
            href="/receipts"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-900"
          >
            View all
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {stats.recentReceipts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
            <ReceiptIcon className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              No receipts yet — log a contribution to issue your first.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {stats.recentReceipts.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <Avatar name={r.memberName} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">
                    {r.memberName}
                  </p>
                  <p className="font-mono text-xs text-gray-500">
                    {r.receiptNumber} · {format(new Date(r.issuedAt), "PPp")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-gray-900">
                    {formatUGX(r.totalAmount)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
