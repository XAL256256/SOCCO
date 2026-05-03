import { prisma } from "./db";
import {
  endOfMonth,
  format,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns";

// ============================================================
// NBOOG Reports — Recreates the Excel-equivalent reports the
// SACCO has historically produced (matched to the March 2026 PDF).
// ============================================================

export type MonthlyCollectionsRow = {
  no: number;
  memberId: string;
  memberName: string;
  memberNumber: string;
  repayments: number;
  savings: number;
  welfare: number;
  charges: number;
  fees: number;
  total: number;
};

export type MonthlyCollectionsReport = {
  month: string; // "MARCH 2026"
  rangeStart: Date;
  rangeEnd: Date;
  rows: MonthlyCollectionsRow[];
  totals: {
    repayments: number;
    savings: number;
    welfare: number;
    charges: number;
    fees: number;
    grand: number;
  };
};

export async function getMonthlyCollections(
  year: number,
  month0: number
): Promise<MonthlyCollectionsReport> {
  const start = new Date(year, month0, 1);
  const end = endOfMonth(start);

  const [members, contribs] = await Promise.all([
    prisma.member.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, memberNumber: true },
    }),
    prisma.contribution.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: {
        memberId: true,
        loanRepayment: true,
        savingsAmount: true,
        welfareAmount: true,
        otherAmount: true,
        otherDescription: true,
        fineAmount: true,
        registrationFee: true,
      },
    }),
  ]);

  const byMember = new Map<string, { repayments: number; savings: number; welfare: number; charges: number; fees: number }>();
  for (const m of members) {
    byMember.set(m.id, { repayments: 0, savings: 0, welfare: 0, charges: 0, fees: 0 });
  }
  for (const c of contribs) {
    const r = byMember.get(c.memberId);
    if (!r) continue;
    r.repayments += c.loanRepayment;
    r.savings += c.savingsAmount;
    r.welfare += c.welfareAmount;
    // Charges = generic ledger items (not welfare/savings/loan/fines/registration)
    r.charges += c.otherAmount;
    r.fees += c.fineAmount + c.registrationFee;
  }

  const rows: MonthlyCollectionsRow[] = members.map((m, idx) => {
    const r = byMember.get(m.id)!;
    return {
      no: idx + 1,
      memberId: m.id,
      memberName: `${m.lastName} ${m.firstName}`.trim(),
      memberNumber: m.memberNumber,
      repayments: r.repayments,
      savings: r.savings,
      welfare: r.welfare,
      charges: r.charges,
      fees: r.fees,
      total: r.repayments + r.savings + r.welfare + r.charges + r.fees,
    };
  });

  const totals = rows.reduce(
    (a, r) => ({
      repayments: a.repayments + r.repayments,
      savings: a.savings + r.savings,
      welfare: a.welfare + r.welfare,
      charges: a.charges + r.charges,
      fees: a.fees + r.fees,
      grand: a.grand + r.total,
    }),
    { repayments: 0, savings: 0, welfare: 0, charges: 0, fees: 0, grand: 0 }
  );

  return {
    month: format(start, "MMMM yyyy").toUpperCase(),
    rangeStart: start,
    rangeEnd: end,
    rows,
    totals,
  };
}

// ============================================================
// Member × Month matrix (used for Savings, Welfare, Borrowings, Repayments)
// ============================================================

export type MatrixCell = number;
export type MatrixRow = {
  no: number;
  memberId: string;
  memberName: string;
  memberNumber: string;
  cells: MatrixCell[];
  total: number;
};
export type MatrixReport = {
  title: string;
  year: number;
  monthLabels: string[];
  rows: MatrixRow[];
  columnTotals: number[];
  grandTotal: number;
};

type MatrixField = "savings" | "welfare" | "loanRepayment";

async function buildContributionMatrix(
  year: number,
  field: MatrixField,
  title: string,
  options?: { showProjectedMonths?: boolean }
): Promise<MatrixReport> {
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let m = 0; m < 12; m++) {
    const start = new Date(year, m, 1);
    const end = endOfMonth(start);
    if (!options?.showProjectedMonths && start > new Date()) continue;
    months.push({
      label: format(start, "d-MMM-yy"),
      start,
      end,
    });
  }
  const monthLabels = months.map((m) => m.label);

  const [members, contribs] = await Promise.all([
    prisma.member.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, memberNumber: true },
    }),
    prisma.contribution.findMany({
      where: { createdAt: { gte: months[0].start, lte: months[months.length - 1].end } },
      select: { memberId: true, savingsAmount: true, welfareAmount: true, loanRepayment: true, createdAt: true },
    }),
  ]);

  const byMember = new Map<string, number[]>();
  for (const m of members) byMember.set(m.id, monthLabels.map(() => 0));

  for (const c of contribs) {
    const arr = byMember.get(c.memberId);
    if (!arr) continue;
    const idx = months.findIndex(
      (mn) => c.createdAt >= mn.start && c.createdAt <= mn.end
    );
    if (idx < 0) continue;
    if (field === "savings") arr[idx] += c.savingsAmount;
    if (field === "welfare") arr[idx] += c.welfareAmount;
    if (field === "loanRepayment") arr[idx] += c.loanRepayment;
  }

  const rows: MatrixRow[] = members.map((m, idx) => {
    const cells = byMember.get(m.id)!;
    return {
      no: idx + 1,
      memberId: m.id,
      memberName: `${m.lastName} ${m.firstName}`.trim(),
      memberNumber: m.memberNumber,
      cells,
      total: cells.reduce((a, b) => a + b, 0),
    };
  });

  const columnTotals = monthLabels.map((_, i) =>
    rows.reduce((a, r) => a + (r.cells[i] ?? 0), 0)
  );
  const grandTotal = columnTotals.reduce((a, b) => a + b, 0);

  return { title, year, monthLabels, rows, columnTotals, grandTotal };
}

export const getSavingsMatrix = (year: number) =>
  buildContributionMatrix(year, "savings", `NBOOG SAVINGS ${year}`);

export const getWelfareMatrix = (year: number) =>
  buildContributionMatrix(year, "welfare", `NBOOG WELFARE ${year}`);

export const getRepaymentsMatrix = (year: number) =>
  buildContributionMatrix(year, "loanRepayment", `NBOOG REPAYMENTS ${year}`);

// ============================================================
// Borrowings report — disbursed loans by month
// ============================================================

export async function getBorrowingsMatrix(year: number): Promise<MatrixReport> {
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let m = 0; m < 12; m++) {
    const start = new Date(year, m, 1);
    const end = endOfMonth(start);
    months.push({ label: format(start, "d-MMM-yy"), start, end });
  }
  const monthLabels = months.map((m) => m.label);

  const [members, loans] = await Promise.all([
    prisma.member.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, memberNumber: true },
    }),
    prisma.loan.findMany({
      where: {
        OR: [{ status: "DISBURSED" }, { status: "ACTIVE" }, { status: "PAID" }],
        disbursedAt: { not: null },
      },
      select: {
        memberId: true,
        principalAmount: true,
        disbursedAt: true,
      },
    }),
  ]);

  const byMember = new Map<string, number[]>();
  for (const m of members) byMember.set(m.id, monthLabels.map(() => 0));

  for (const l of loans) {
    if (!l.disbursedAt) continue;
    const idx = months.findIndex(
      (mn) => l.disbursedAt! >= mn.start && l.disbursedAt! <= mn.end
    );
    if (idx < 0) continue;
    const arr = byMember.get(l.memberId);
    if (!arr) continue;
    arr[idx] += l.principalAmount;
  }

  const rows: MatrixRow[] = members.map((m, idx) => {
    const cells = byMember.get(m.id)!;
    return {
      no: idx + 1,
      memberId: m.id,
      memberName: `${m.lastName} ${m.firstName}`.trim(),
      memberNumber: m.memberNumber,
      cells,
      total: cells.reduce((a, b) => a + b, 0),
    };
  });
  const columnTotals = monthLabels.map((_, i) =>
    rows.reduce((a, r) => a + (r.cells[i] ?? 0), 0)
  );
  const grandTotal = columnTotals.reduce((a, b) => a + b, 0);

  return { title: `NBOOG BORROWINGS ${year}`, year, monthLabels, rows, columnTotals, grandTotal };
}

// ============================================================
// Loan applications grouped by month (matches PDF page 8)
// ============================================================

export type LoanAppRow = {
  no: number;
  borrower: string;
  memberNumber: string;
  requestedAmount: number;
  approvedAmount: number;
  termMonths: number;
  status: string;
};

export type LoanAppGroup = {
  monthLabel: string;
  rows: LoanAppRow[];
  totals: { requested: number; approved: number };
};

export async function getLoanApplicationsByMonth(
  year: number
): Promise<LoanAppGroup[]> {
  const groups: LoanAppGroup[] = [];

  const loans = await prisma.loan.findMany({
    where: {
      appliedAt: {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31, 23, 59),
      },
    },
    orderBy: [{ appliedAt: "asc" }],
    include: {
      member: { select: { firstName: true, lastName: true, memberNumber: true } },
    },
  });

  const byMonth = new Map<number, typeof loans>();
  for (const l of loans) {
    const k = l.appliedAt.getMonth();
    if (!byMonth.has(k)) byMonth.set(k, [] as typeof loans);
    byMonth.get(k)!.push(l);
  }

  const monthsSorted = [...byMonth.keys()].sort((a, b) => a - b);
  for (const m of monthsSorted) {
    const ms = byMonth.get(m)!;
    const rows: LoanAppRow[] = ms.map((l, i) => ({
      no: i + 1,
      borrower: `${l.member.lastName} ${l.member.firstName}`,
      memberNumber: l.member.memberNumber,
      requestedAmount: l.requestedAmount,
      approvedAmount: l.principalAmount,
      termMonths: l.termMonths,
      status: l.status,
    }));
    groups.push({
      monthLabel: format(new Date(year, m, 1), "MMMM yyyy"),
      rows,
      totals: rows.reduce(
        (a, r) => ({
          requested: a.requested + r.requestedAmount,
          approved: a.approved + r.approvedAmount,
        }),
        { requested: 0, approved: 0 }
      ),
    });
  }

  return groups;
}

// ============================================================
// Welfare arrears — Expected vs Paid per member
// ============================================================

export type WelfareArrearsRow = {
  no: number;
  memberId: string;
  memberName: string;
  memberNumber: string;
  monthsActive: number;
  expected: number;
  paid: number;
  arrears: number;
};

export async function getWelfareArrears(
  asOf: Date = new Date(),
  monthlyExpected = 30000
): Promise<{ rows: WelfareArrearsRow[]; totals: { expected: number; paid: number; arrears: number } }> {
  const members = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      contributions: {
        where: { createdAt: { lte: asOf } },
        select: { welfareAmount: true },
      },
    },
  });

  const rows: WelfareArrearsRow[] = members.map((m, idx) => {
    const monthsActive = Math.max(
      1,
      Math.floor(
        (asOf.getTime() - m.joinedAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
      ) + 1
    );
    const expected = monthsActive * monthlyExpected;
    const paid = m.contributions.reduce((a, c) => a + c.welfareAmount, 0);
    return {
      no: idx + 1,
      memberId: m.id,
      memberName: `${m.lastName} ${m.firstName}`,
      memberNumber: m.memberNumber,
      monthsActive,
      expected,
      paid,
      arrears: Math.max(0, expected - paid),
    };
  });

  const totals = rows.reduce(
    (a, r) => ({
      expected: a.expected + r.expected,
      paid: a.paid + r.paid,
      arrears: a.arrears + r.arrears,
    }),
    { expected: 0, paid: 0, arrears: 0 }
  );

  return { rows, totals };
}

// Available years for picker
export async function getAvailableReportYears(): Promise<number[]> {
  const oldest = await prisma.contribution.findFirst({
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
  const start = oldest?.createdAt.getFullYear() ?? new Date().getFullYear();
  const end = new Date().getFullYear();
  const years: number[] = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years.length ? years : [end];
}
