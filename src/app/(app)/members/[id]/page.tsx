import {
  ArrowLeft,
  CalendarCheck,
  FileText,
  HandCoins,
  PiggyBank,
  Receipt as ReceiptIcon,
  User2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { formatUGX } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      contributions: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          receipt: true,
          meeting: { select: { title: true, meetingDate: true } },
        },
      },
      attendance: {
        orderBy: { checkedInAt: "desc" },
        take: 30,
        include: { meeting: { select: { title: true, meetingDate: true } } },
      },
    },
  });

  if (!member) notFound();

  const totals = member.contributions.reduce(
    (acc, c) => {
      acc.total += c.totalAmount;
      acc.savings += c.savingsAmount;
      acc.welfare += c.welfareAmount;
      acc.loan += c.loanRepayment;
      return acc;
    },
    { total: 0, savings: 0, welfare: 0, loan: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to members
        </Link>
        <Link
          href={`/members/${member.id}/statement`}
          className="btn-outline !py-2.5"
        >
          <FileText className="h-4 w-4" />
          Open statement
        </Link>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary-500 to-primary-700 p-6 text-white shadow-floating sm:p-8">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 animate-morphing"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <Avatar
            name={`${member.firstName} ${member.lastName}`}
            size="xl"
            className="!h-20 !w-20 !text-3xl ring-4 ring-white/20"
          />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs uppercase tracking-widest text-primary-100">
              {member.memberNumber}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
              {member.firstName} {member.lastName}
            </h1>
            <p className="mt-1 text-sm text-primary-100">
              {member.occupation ?? "Member"} · {member.phoneNumber}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-3">
            <span className="rounded-2xl bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider">
              {member.status}
            </span>
            {member.gender && (
              <span className="rounded-2xl bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider">
                {member.gender}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total contributed",
            value: totals.total,
            icon: HandCoins,
            tint: "bg-primary-50 text-primary-700 border-primary-200",
          },
          {
            label: "Savings",
            value: totals.savings,
            icon: PiggyBank,
            tint: "bg-secondary-50 text-secondary-700 border-secondary-200",
          },
          {
            label: "Welfare",
            value: totals.welfare,
            icon: ReceiptIcon,
            tint: "bg-accent-50 text-accent-800 border-accent-200",
          },
          {
            label: "Loan repaid",
            value: totals.loan,
            icon: CalendarCheck,
            tint: "bg-gray-50 text-gray-700 border-gray-200",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-[24px] border-2 p-5 ${s.tint}`}
            >
              <div className="flex items-start justify-between">
                <p className="font-mono text-xs uppercase tracking-widest opacity-80">
                  {s.label}
                </p>
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 font-mono text-2xl font-bold">
                <AnimatedNumber value={s.value} prefix="UGX" duration={1200} />
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent contributions */}
      <div className="rounded-[28px] bg-white p-5 shadow-elevated sm:p-7">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wider">
              Recent contributions
            </h2>
            <p className="text-sm text-gray-500">Last 30 movements</p>
          </div>
          <Link
            href={`/contributions/new?memberId=${member.id}`}
            className="btn-primary !py-2.5"
          >
            <HandCoins className="h-4 w-4" />
            Log contribution
          </Link>
        </div>

        {member.contributions.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
            <User2 className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              No contributions logged yet for this member.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {member.contributions.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    {c.meeting?.title ?? "Direct deposit"}
                  </p>
                  <p className="font-mono text-xs text-gray-500">
                    {format(c.createdAt, "PPp")}
                    {c.receipt && ` · ${c.receipt.receiptNumber}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {c.welfareAmount > 0 && (
                    <span className="chip-primary">
                      W {formatUGX(c.welfareAmount)}
                    </span>
                  )}
                  {c.savingsAmount > 0 && (
                    <span className="chip-secondary">
                      S {formatUGX(c.savingsAmount)}
                    </span>
                  )}
                  {c.loanRepayment > 0 && (
                    <span className="chip-accent">
                      L {formatUGX(c.loanRepayment)}
                    </span>
                  )}
                  <span className="font-mono font-bold text-gray-900">
                    {formatUGX(c.totalAmount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Attendance */}
      <div className="rounded-[28px] bg-white p-5 shadow-elevated sm:p-7">
        <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wider">
          Attendance
        </h2>
        {member.attendance.length === 0 ? (
          <p className="text-sm text-gray-500">No attendance records.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {member.attendance.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{a.meeting.title}</p>
                  <p className="font-mono text-xs text-gray-500">
                    {format(a.meeting.meetingDate, "PPP")}
                  </p>
                </div>
                <span
                  className={
                    a.status === "PRESENT"
                      ? "chip-secondary"
                      : a.status === "LATE"
                      ? "chip-accent"
                      : a.status === "EXCUSED"
                      ? "chip-gray"
                      : "chip-danger"
                  }
                >
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
