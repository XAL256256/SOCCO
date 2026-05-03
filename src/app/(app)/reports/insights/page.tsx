import { format, subMonths, startOfMonth } from "date-fns";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ContributionHeatmap } from "@/components/reports/ContributionHeatmap";
import { CollectionsChart } from "@/components/charts/CollectionsChart";
import { ReportShell } from "@/components/reports/ReportShell";
import { formatUGX } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsInsightsPage() {
  await requireUser();

  const horizonMonths = 6;
  const start = subMonths(startOfMonth(new Date()), horizonMonths - 1);

  const [members, contributions] = await Promise.all([
    prisma.member.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, memberNumber: true },
    }),
    prisma.contribution.findMany({
      where: { createdAt: { gte: start } },
      select: {
        memberId: true,
        totalAmount: true,
        savingsAmount: true,
        welfareAmount: true,
        loanRepayment: true,
        createdAt: true,
      },
    }),
  ]);

  const labels: string[] = [];
  for (let i = horizonMonths - 1; i >= 0; i--) {
    labels.push(format(subMonths(new Date(), i), "MMM"));
  }

  const heatmap = members.map((m) => {
    const months = labels.map(() => 0);
    for (const c of contributions) {
      if (c.memberId !== m.id) continue;
      const idx = labels.indexOf(format(c.createdAt, "MMM"));
      if (idx >= 0) months[idx] += c.totalAmount;
    }
    return {
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      memberNumber: m.memberNumber,
      months,
    };
  });

  const trendMap = new Map<string, { amount: number; savings: number; welfare: number }>();
  labels.forEach((l) => trendMap.set(l, { amount: 0, savings: 0, welfare: 0 }));
  for (const c of contributions) {
    const key = format(c.createdAt, "MMM");
    const cur = trendMap.get(key);
    if (!cur) continue;
    cur.amount += c.totalAmount;
    cur.savings += c.savingsAmount;
    cur.welfare += c.welfareAmount;
  }
  const trend = Array.from(trendMap.entries()).map(([month, v]) => ({ month, ...v }));

  const totals = contributions.reduce(
    (a, c) => ({
      total: a.total + c.totalAmount,
      savings: a.savings + c.savingsAmount,
      welfare: a.welfare + c.welfareAmount,
      loan: a.loan + c.loanRepayment,
    }),
    { total: 0, savings: 0, welfare: 0, loan: 0 }
  );

  const mix = [
    { name: "Savings", value: totals.savings, color: "#16a34a" },
    { name: "Welfare", value: totals.welfare, color: "#ec5a2e" },
    { name: "Loan repayment", value: totals.loan, color: "#eab308" },
    {
      name: "Other",
      value: totals.total - totals.savings - totals.welfare - totals.loan,
      color: "#0891b2",
    },
  ].filter((s) => s.value > 0);

  return (
    <ReportShell
      title="Performance Insights"
      subtitle="Visual six-month overview · ideal for chairperson updates"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Total received", value: totals.total, tint: "bg-primary-50 text-primary-700 border-primary-200" },
          { label: "Total savings", value: totals.savings, tint: "bg-secondary-50 text-secondary-700 border-secondary-200" },
          { label: "Total welfare", value: totals.welfare, tint: "bg-accent-50 text-accent-800 border-accent-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-[20px] border-2 p-4 ${s.tint}`}>
            <p className="font-mono text-xs uppercase tracking-widest opacity-80">
              {s.label}
            </p>
            <p className="mt-2 font-mono text-xl font-bold">{formatUGX(s.value)}</p>
          </div>
        ))}
      </div>

      <CollectionsChart monthlyData={trend} mixData={mix} />

      <div className="mt-6">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gray-500">
          Member contribution heatmap
        </h2>
        <p className="text-sm text-gray-500">
          Each cell = a member&apos;s total contribution that month.
        </p>
        <div className="mt-3 overflow-x-auto">
          <ContributionHeatmap labels={labels} rows={heatmap} />
        </div>
      </div>
    </ReportShell>
  );
}
