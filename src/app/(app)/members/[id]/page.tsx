import { ArrowLeft, CalendarCheck, FileText, HandCoins, PiggyBank, Receipt as ReceiptIcon, User2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireUser } from "@/lib/auth";
import { formatUGX } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { getMember } from "@/lib/mock/queries";
import { ATTENDANCE, CONTRIBUTIONS, MEETINGS, RECEIPTS } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const contributions = CONTRIBUTIONS.filter((c) => c.memberId === id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 30)
    .map((c) => ({
      ...c,
      receipt: RECEIPTS.find((r) => r.contributionId === c.id) ?? null,
      meeting: c.meetingId ? MEETINGS.find((m) => m.id === c.meetingId) ?? null : null,
    }));

  const attendance = ATTENDANCE.filter((a) => a.memberId === id)
    .sort((a, b) => b.checkedInAt.getTime() - a.checkedInAt.getTime())
    .slice(0, 30)
    .map((a) => ({
      ...a,
      meeting: MEETINGS.find((m) => m.id === a.meetingId)!,
    }));

  const totals = contributions.reduce(
    (acc, c) => ({
      total: acc.total + c.totalAmount,
      savings: acc.savings + c.savingsAmount,
      welfare: acc.welfare + c.welfareAmount,
      loan: acc.loan + c.loanRepayment,
    }),
    { total: 0, savings: 0, welfare: 0, loan: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/members"
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-dim hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to members
        </Link>
        <Link
          href={`/members/${member.id}/statement`}
          className="font-mono text-[10px] tracking-widest uppercase px-3 py-2 rounded-[2px] border border-line hover:border-gold-bd hover:text-gold transition-colors flex items-center gap-1.5"
        >
          <FileText className="h-3 w-3" />
          Open statement
        </Link>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[4px] border border-line bg-surface p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-[2px] bg-gold-dim border border-gold-bd flex items-center justify-center flex-shrink-0">
            <span className="font-syne font-black text-gold text-2xl">
              {`${member.firstName[0]}${member.lastName[0]}`}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
              {member.memberNumber}
            </p>
            <h1 className="mt-1 font-syne text-3xl font-bold text-txt">
              {member.firstName} {member.lastName}
            </h1>
            <p className="mt-1 font-mono text-xs text-sub">
              {member.occupation ?? "Member"} · {member.phoneNumber}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="chip-secondary">{member.status}</span>
            {member.gender && <span className="chip-gray">{member.gender}</span>}
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total contributed", value: totals.total, icon: HandCoins, color: "#E8A838" },
          { label: "Savings", value: totals.savings, icon: PiggyBank, color: "#2DC98A" },
          { label: "Welfare", value: totals.welfare, icon: ReceiptIcon, color: "#E8A838" },
          { label: "Loan repaid", value: totals.loan, icon: CalendarCheck, color: "#8892A4" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[4px] border border-line bg-surface p-4">
              <div className="flex items-start justify-between">
                <p className="font-mono text-[9px] tracking-widest uppercase text-dim">{s.label}</p>
                <Icon className="h-3.5 w-3.5 text-dim" style={{ color: s.color }} />
              </div>
              <p className="mt-3 font-syne text-2xl font-bold" style={{ color: s.color }}>
                <AnimatedNumber value={s.value} prefix="UGX" duration={1200} />
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent contributions */}
      <div className="rounded-[4px] border border-line bg-surface p-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-dim mb-0.5">
              Recent contributions
            </p>
            <p className="font-dm text-sub text-xs">Last 30 movements</p>
          </div>
          <Link
            href={`/contributions/new?memberId=${member.id}`}
            className="btn-primary flex items-center gap-2 text-xs"
          >
            <HandCoins className="h-3.5 w-3.5" />
            Log contribution
          </Link>
        </div>

        {contributions.length === 0 ? (
          <div className="rounded-[2px] border border-dashed border-line p-10 text-center">
            <User2 className="mx-auto h-6 w-6 text-dim" />
            <p className="mt-3 font-mono text-[10px] tracking-widest uppercase text-dim">
              No contributions logged yet for this member
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {contributions.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-dm font-medium text-txt">
                    {c.meeting?.title ?? "Direct deposit"}
                  </p>
                  <p className="font-mono text-[10px] text-dim">
                    {format(c.createdAt, "PPp")}
                    {c.receipt && ` · ${c.receipt.receiptNumber}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {c.welfareAmount > 0 && <span className="chip-primary">W {formatUGX(c.welfareAmount)}</span>}
                  {c.savingsAmount > 0 && <span className="chip-secondary">S {formatUGX(c.savingsAmount)}</span>}
                  {c.loanRepayment > 0 && <span className="chip-accent">L {formatUGX(c.loanRepayment)}</span>}
                  <span className="font-mono font-bold text-gold" data-money>
                    {formatUGX(c.totalAmount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Attendance */}
      <div className="rounded-[4px] border border-line bg-surface p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-dim mb-4">Attendance</p>
        {attendance.length === 0 ? (
          <p className="font-mono text-[10px] tracking-widest uppercase text-dim">No attendance records</p>
        ) : (
          <ul className="divide-y divide-line">
            {attendance.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-dm font-medium text-txt">{a.meeting.title}</p>
                  <p className="font-mono text-[10px] text-dim">{format(a.meeting.meetingDate, "PPP")}</p>
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
