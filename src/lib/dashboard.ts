import { format, startOfMonth, subMonths } from "date-fns";
import {
  CONTRIBUTIONS, MEMBERS, RECEIPTS, ATTENDANCE, LOANS, FINES, TODAY,
} from "./data/source";

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
  collectionDelta: number;
  pendingLoanCount: number;
  outstandingLoanTotal: number;
  outstandingFineCount: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = TODAY;
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);

  const startThisMonth = startOfMonth(now);
  const startPrevMonth = startOfMonth(subMonths(now, 1));

  const totals = CONTRIBUTIONS.reduce(
    (a, c) => ({
      total: a.total + c.totalAmount,
      savings: a.savings + c.savingsAmount,
      welfare: a.welfare + c.welfareAmount,
      loan: a.loan + c.loanRepayment,
      shares: a.shares + c.shareAmount,
      fines: a.fines + c.fineAmount,
      reg: a.reg + c.registrationFee,
      other: a.other + c.otherAmount,
    }),
    { total: 0, savings: 0, welfare: 0, loan: 0, shares: 0, fines: 0, reg: 0, other: 0 }
  );

  const thisMonthTotal = CONTRIBUTIONS.filter((c) => c.createdAt >= startThisMonth).reduce(
    (a, c) => a + c.totalAmount,
    0
  );
  const prevMonthTotal = CONTRIBUTIONS.filter(
    (c) => c.createdAt >= startPrevMonth && c.createdAt < startThisMonth
  ).reduce((a, c) => a + c.totalAmount, 0);
  const collectionDelta =
    prevMonthTotal > 0 ? ((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;

  const monthlyMap = new Map<string, { amount: number; savings: number; welfare: number }>();
  for (let i = 5; i >= 0; i--) {
    const key = format(subMonths(startThisMonth, i), "MMM");
    monthlyMap.set(key, { amount: 0, savings: 0, welfare: 0 });
  }
  for (const c of CONTRIBUTIONS) {
    if (c.createdAt < subMonths(startThisMonth, 5)) continue;
    const key = format(c.createdAt, "MMM");
    const cur = monthlyMap.get(key);
    if (!cur) continue;
    cur.amount += c.totalAmount;
    cur.savings += c.savingsAmount;
    cur.welfare += c.welfareAmount;
  }

  const contributionMix = [
    { name: "Savings",        value: totals.savings, color: "#1F6A40" },
    { name: "Welfare",        value: totals.welfare, color: "#7C611C" },
    { name: "Loan repayment", value: totals.loan,    color: "#B05334" },
    { name: "Shares",         value: totals.shares,  color: "#564C42" },
    { name: "Fines",          value: totals.fines,   color: "#B91C1C" },
    { name: "Other",          value: totals.reg + totals.other, color: "#9F9686" },
  ].filter((s) => s.value > 0);

  const recentReceipts = RECEIPTS.slice()
    .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime())
    .slice(0, 8)
    .map((r) => {
      const member = MEMBERS.find((m) => m.id === r.memberId);
      return {
        id: r.id,
        receiptNumber: r.receiptNumber,
        memberName: member ? `${member.firstName} ${member.lastName}` : "—",
        totalAmount: r.totalAmount,
        issuedAt: r.issuedAt.toISOString(),
      };
    });

  const presentToday = ATTENDANCE.filter(
    (a) => a.status === "PRESENT" && a.checkedInAt >= startToday
  ).length;
  const receiptsToday = RECEIPTS.filter((r) => r.issuedAt >= startToday).length;

  const pendingLoanCount = LOANS.filter((l) => l.status === "PENDING").length;
  const outstandingLoanTotal = LOANS.filter(
    (l) => l.status === "DISBURSED" || l.status === "ACTIVE"
  ).reduce((a, l) => a + Math.max(0, l.principalAmount - l.amountRepaid), 0);
  const outstandingFineCount = FINES.filter((f) => f.status === "OUTSTANDING").length;

  return {
    totalCollections: totals.total,
    totalSavings: totals.savings,
    totalWelfare: totals.welfare,
    totalLoanRepayment: totals.loan,
    totalMembers: MEMBERS.length,
    activeMembers: MEMBERS.filter((m) => m.status === "ACTIVE").length,
    membersPresentToday: presentToday,
    receiptsToday,
    monthlyTrend: Array.from(monthlyMap.entries()).map(([month, v]) => ({ month, ...v })),
    contributionMix,
    recentReceipts,
    collectionDelta,
    pendingLoanCount,
    outstandingLoanTotal,
    outstandingFineCount,
  };
}
