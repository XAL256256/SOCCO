import { notFound } from "next/navigation";
import { endOfYear, startOfYear } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getAvailableReportYears } from "@/lib/reports";
import { getMember } from "@/lib/data/queries";
import {
  ATTENDANCE, CONTRIBUTIONS, FINES, LOAN_INSTALLMENTS,
  LOANS, MEETINGS, RECEIPTS, TODAY,
} from "@/lib/data/source";
import { StatementClient } from "./StatementClient";

export const dynamic = "force-dynamic";

export default async function MemberStatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const sp = await searchParams;

  const years = await getAvailableReportYears();
  const year = Number(sp.year) || TODAY.getFullYear();
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));

  const member = getMember(id);
  if (!member) notFound();

  const contribs = CONTRIBUTIONS.filter(
    (c) => c.memberId === id && c.createdAt >= yearStart && c.createdAt <= yearEnd
  ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const att = ATTENDANCE.filter(
    (a) => a.memberId === id && a.checkedInAt >= yearStart && a.checkedInAt <= yearEnd
  ).sort((a, b) => a.checkedInAt.getTime() - b.checkedInAt.getTime());

  const memberLoans = LOANS.filter((l) => l.memberId === id).sort(
    (a, b) => b.appliedAt.getTime() - a.appliedAt.getTime()
  );

  const memberFines = FINES.filter(
    (f) => f.memberId === id && f.createdAt >= yearStart && f.createdAt <= yearEnd
  ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const data = {
    member: {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      memberNumber: member.memberNumber,
      phoneNumber: member.phoneNumber,
      email: member.email,
      joinedAt: member.joinedAt.toISOString(),
      status: member.status,
    },
    year,
    years,
    contributions: contribs.map((c) => {
      const r = RECEIPTS.find((x) => x.contributionId === c.id) ?? null;
      const m = c.meetingId ? MEETINGS.find((x) => x.id === c.meetingId) ?? null : null;
      return {
        id: c.id,
        createdAt: c.createdAt.toISOString(),
        welfareAmount: c.welfareAmount,
        savingsAmount: c.savingsAmount,
        loanRepayment: c.loanRepayment,
        fineAmount: c.fineAmount,
        shareAmount: c.shareAmount,
        registrationFee: c.registrationFee,
        otherAmount: c.otherAmount,
        totalAmount: c.totalAmount,
        paymentMethod: c.paymentMethod,
        meeting: m ? { title: m.title, meetingDate: m.meetingDate.toISOString() } : null,
        receipt: r
          ? {
              id: r.id,
              receiptNumber: r.receiptNumber,
              totalAmount: r.totalAmount,
              integrityHash: r.integrityHash,
              version: r.version,
              issuedAt: r.issuedAt.toISOString(),
            }
          : null,
      };
    }),
    attendance: att.map((a) => {
      const m = MEETINGS.find((x) => x.id === a.meetingId)!;
      return {
        id: a.id,
        status: a.status,
        checkedInAt: a.checkedInAt.toISOString(),
        meeting: { title: m.title, meetingDate: m.meetingDate.toISOString() },
      };
    }),
    fines: memberFines.map((f) => ({
      id: f.id,
      reason: f.reason,
      amount: f.amount,
      description: f.description,
      status: f.status,
      createdAt: f.createdAt.toISOString(),
    })),
    loans: memberLoans.map((l) => {
      const schedule = LOAN_INSTALLMENTS.filter((s) => s.loanId === l.id).sort(
        (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
      );
      return {
        id: l.id,
        loanNumber: l.loanNumber,
        principalAmount: l.principalAmount,
        requestedAmount: l.requestedAmount,
        interestRate: l.interestRate,
        termMonths: l.termMonths,
        amountRepaid: l.amountRepaid,
        status: l.status,
        purpose: l.purpose,
        appliedAt: l.appliedAt.toISOString(),
        disbursedAt: l.disbursedAt?.toISOString() ?? null,
        dueAt: l.dueAt?.toISOString() ?? null,
        schedule: schedule.map((s) => ({
          id: s.id,
          dueDate: s.dueDate.toISOString(),
          amount: s.amount,
          paidAmount: s.paidAmount,
          status: s.status,
        })),
      };
    }),
  };

  return (
    <div className="space-y-5">
      <div className="no-print">
        <Link
          href={`/members/${member.id}`}
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-dim hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to profile
        </Link>
      </div>

      <StatementClient {...data} />
    </div>
  );
}
