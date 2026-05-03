import { prisma } from "./db";
import { startOfMonth, subMonths, format } from "date-fns";

export type DashboardStats = {
  totalCollections: number;
  totalSavings: number;
  totalWelfare: number;
  totalLoanRepayment: number;
  totalMembers: number;
  activeMembers: number;
  membersPresentToday: number;
  receiptsToday: number;
  monthlyTrend: { month: string; amount: number; savings: number; welfare: number }[];
  contributionMix: { name: string; value: number; color: string }[];
  recentReceipts: {
    id: string;
    receiptNumber: string;
    memberName: string;
    totalAmount: number;
    issuedAt: string;
  }[];
  collectionDelta: number; // % vs previous month
  pendingLoanCount: number;
  outstandingLoanTotal: number;
  outstandingFineCount: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);

  const startThisMonth = startOfMonth(now);
  const startPrevMonth = startOfMonth(subMonths(now, 1));

  const [
    totalsAgg,
    membersTotal,
    membersActive,
    presentToday,
    receiptsToday,
    thisMonthAgg,
    prevMonthAgg,
    monthlyRaw,
    recentReceipts,
  ] = await Promise.all([
    prisma.contribution.aggregate({
      _sum: {
        totalAmount: true,
        savingsAmount: true,
        welfareAmount: true,
        loanRepayment: true,
        fineAmount: true,
        shareAmount: true,
        registrationFee: true,
        otherAmount: true,
      },
    }),
    prisma.member.count(),
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.attendance.count({
      where: {
        status: "PRESENT",
        checkedInAt: { gte: startToday },
      },
    }),
    prisma.receipt.count({ where: { issuedAt: { gte: startToday } } }),
    prisma.contribution.aggregate({
      _sum: { totalAmount: true },
      where: { createdAt: { gte: startThisMonth } },
    }),
    prisma.contribution.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: startPrevMonth, lt: startThisMonth },
      },
    }),
    prisma.contribution.findMany({
      where: { createdAt: { gte: subMonths(startThisMonth, 5) } },
      select: {
        createdAt: true,
        totalAmount: true,
        savingsAmount: true,
        welfareAmount: true,
      },
    }),
    prisma.receipt.findMany({
      orderBy: { issuedAt: "desc" },
      take: 6,
      select: {
        id: true,
        receiptNumber: true,
        totalAmount: true,
        issuedAt: true,
        member: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  const [pendingLoanCount, activeLoans, outstandingFineCount] = await Promise.all([
    prisma.loan.count({ where: { status: "PENDING" } }),
    prisma.loan.findMany({
      where: { status: { in: ["DISBURSED", "ACTIVE"] } },
      select: { principalAmount: true, amountRepaid: true },
    }),
    prisma.fine.count({ where: { status: "OUTSTANDING" } }),
  ]);
  const outstandingLoanTotal = activeLoans.reduce(
    (a, l) => a + Math.max(0, l.principalAmount - l.amountRepaid),
    0
  );

  const monthlyMap = new Map<string, { amount: number; savings: number; welfare: number }>();
  for (let i = 5; i >= 0; i--) {
    const key = format(subMonths(startThisMonth, i), "MMM");
    monthlyMap.set(key, { amount: 0, savings: 0, welfare: 0 });
  }
  for (const c of monthlyRaw) {
    const key = format(c.createdAt, "MMM");
    const cur = monthlyMap.get(key);
    if (cur) {
      cur.amount += c.totalAmount;
      cur.savings += c.savingsAmount;
      cur.welfare += c.welfareAmount;
    }
  }
  const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, v]) => ({
    month,
    ...v,
  }));

  const sums = totalsAgg._sum;
  const contributionMix = [
    { name: "Savings", value: sums.savingsAmount ?? 0, color: "#16a34a" },
    { name: "Welfare", value: sums.welfareAmount ?? 0, color: "#ec5a2e" },
    { name: "Loan Repayment", value: sums.loanRepayment ?? 0, color: "#eab308" },
    { name: "Shares", value: sums.shareAmount ?? 0, color: "#0891b2" },
    { name: "Fines", value: sums.fineAmount ?? 0, color: "#dc2626" },
    { name: "Other", value: (sums.registrationFee ?? 0) + (sums.otherAmount ?? 0), color: "#78716c" },
  ].filter((s) => s.value > 0);

  const thisMonth = thisMonthAgg._sum.totalAmount ?? 0;
  const prevMonth = prevMonthAgg._sum.totalAmount ?? 0;
  const collectionDelta =
    prevMonth > 0 ? ((thisMonth - prevMonth) / prevMonth) * 100 : 0;

  return {
    totalCollections: sums.totalAmount ?? 0,
    totalSavings: sums.savingsAmount ?? 0,
    totalWelfare: sums.welfareAmount ?? 0,
    totalLoanRepayment: sums.loanRepayment ?? 0,
    totalMembers: membersTotal,
    activeMembers: membersActive,
    membersPresentToday: presentToday,
    receiptsToday,
    monthlyTrend,
    contributionMix,
    recentReceipts: recentReceipts.map((r) => ({
      id: r.id,
      receiptNumber: r.receiptNumber,
      memberName: `${r.member.firstName} ${r.member.lastName}`,
      totalAmount: r.totalAmount,
      issuedAt: r.issuedAt.toISOString(),
    })),
    collectionDelta,
    pendingLoanCount,
    outstandingLoanTotal,
    outstandingFineCount,
  };
}
