import Link from "next/link";
import { AlertTriangle, ArrowUpRight, ShieldCheck, Wallet2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/dashboard";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { CollectionsChart } from "@/components/charts/CollectionsChart";
import { RecentReceipts } from "@/components/dashboard/RecentReceipts";
import { formatUGX } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const stats = await getDashboardStats();
  const isChair = user.role === "ADMIN" || user.role === "CHAIRPERSON";

  return (
    <div className="space-y-0">
      <DashboardHero
        userName={user.fullName}
        saccoName="NBOOG SACCO"
        totalCollections={stats.totalCollections}
        membersPresent={stats.membersPresentToday}
        totalMembers={stats.totalMembers}
        savings={stats.totalSavings}
        welfare={stats.totalWelfare}
        loanRepayments={stats.totalLoanRepayment}
        receiptsToday={stats.receiptsToday}
        activeMembers={stats.activeMembers}
        collectionDelta={stats.collectionDelta}
      />

      {/* Chairperson oversight strip */}
      {isChair &&
        (stats.pendingLoanCount > 0 ||
          stats.outstandingFineCount > 0 ||
          stats.outstandingLoanTotal > 0) && (
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 mt-3">
            <Link
              href="/approvals"
              className="group flex items-center gap-4 rounded-[4px] border border-gold-bd bg-gold-dim p-4 transition-all hover:-translate-y-0.5"
            >
              <div className="grid h-10 w-10 place-items-center rounded-[2px] bg-gold text-bg">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-gold opacity-80">
                  Pending approvals
                </p>
                <p className="font-syne text-xl font-bold text-gold">
                  {stats.pendingLoanCount}{" "}
                  <span className="text-sm font-normal text-sub">loans</span>
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gold opacity-60 group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/loans"
              className="group flex items-center gap-4 rounded-[4px] border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-line-h"
            >
              <div className="grid h-10 w-10 place-items-center rounded-[2px] bg-raised text-sub">
                <Wallet2 className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-dim">
                  Outstanding loans
                </p>
                <p className="font-syne text-xl font-bold text-txt">
                  {formatUGX(stats.outstandingLoanTotal)}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-dim group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/approvals"
              className="group flex items-center gap-4 rounded-[4px] border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-line-h"
            >
              <div className="grid h-10 w-10 place-items-center rounded-[2px] bg-raised text-sub">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-dim">
                  Outstanding fines
                </p>
                <p className="font-syne text-xl font-bold text-txt">
                  {stats.outstandingFineCount}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-dim group-hover:translate-x-0.5" />
            </Link>
          </section>
        )}

      <CollectionsChart
        monthlyData={stats.monthlyTrend}
        mixData={stats.contributionMix}
      />

      <RecentReceipts receipts={stats.recentReceipts} />
    </div>
  );
}
