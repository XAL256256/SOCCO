import { notFound } from "next/navigation";
import { endOfYear, format, startOfYear } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getAvailableReportYears } from "@/lib/reports";
import { formatUGX } from "@/lib/utils";
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
  const year = Number(sp.year) || new Date().getFullYear();
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      contributions: {
        where: { createdAt: { gte: yearStart, lte: yearEnd } },
        orderBy: { createdAt: "asc" },
        include: {
          receipt: {
            select: {
              id: true,
              receiptNumber: true,
              totalAmount: true,
              integrityHash: true,
              version: true,
              issuedAt: true,
            },
          },
          meeting: { select: { title: true, meetingDate: true } },
        },
      },
      loans: {
        orderBy: { appliedAt: "desc" },
        include: { schedule: { orderBy: { dueDate: "asc" } } },
      },
      attendance: {
        where: { checkedInAt: { gte: yearStart, lte: yearEnd } },
        orderBy: { checkedInAt: "asc" },
        include: { meeting: { select: { title: true, meetingDate: true } } },
      },
      fines: {
        where: { createdAt: { gte: yearStart, lte: yearEnd } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!member) notFound();

  // Serialise dates for client component
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
    contributions: member.contributions.map((c) => ({
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
      meeting: c.meeting
        ? {
            title: c.meeting.title,
            meetingDate: c.meeting.meetingDate.toISOString(),
          }
        : null,
      receipt: c.receipt
        ? {
            id: c.receipt.id,
            receiptNumber: c.receipt.receiptNumber,
            totalAmount: c.receipt.totalAmount,
            integrityHash: c.receipt.integrityHash,
            version: c.receipt.version,
            issuedAt: c.receipt.issuedAt.toISOString(),
          }
        : null,
    })),
    attendance: member.attendance.map((a) => ({
      id: a.id,
      status: a.status,
      checkedInAt: a.checkedInAt.toISOString(),
      meeting: {
        title: a.meeting.title,
        meetingDate: a.meeting.meetingDate.toISOString(),
      },
    })),
    fines: member.fines.map((f) => ({
      id: f.id,
      reason: f.reason,
      amount: f.amount,
      description: f.description,
      status: f.status,
      createdAt: f.createdAt.toISOString(),
    })),
    loans: member.loans.map((l) => ({
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
      schedule: l.schedule.map((s) => ({
        id: s.id,
        dueDate: s.dueDate.toISOString(),
        amount: s.amount,
        paidAmount: s.paidAmount,
        status: s.status,
      })),
    })),
  };

  return (
    <div className="space-y-5">
      <div className="no-print">
        <Link
          href={`/members/${member.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
      </div>

      <StatementClient {...data} />
    </div>
  );
}
