import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireUser } from "@/lib/auth";
import { activeMembers, getMeeting, getMeetingAttendance } from "@/lib/mock/queries";
import { CONTRIBUTIONS } from "@/lib/mock/data";
import { MeetingDetailClient } from "./MeetingDetailClient";

export const dynamic = "force-dynamic";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const meeting = getMeeting(id);
  if (!meeting) notFound();

  const attendance = getMeetingAttendance(id);
  const meetingContribs = CONTRIBUTIONS.filter((c) => c.meetingId === id);

  const totals = meetingContribs.reduce(
    (a, c) => ({
      total: a.total + c.totalAmount,
      savings: a.savings + c.savingsAmount,
      welfare: a.welfare + c.welfareAmount,
    }),
    { total: 0, savings: 0, welfare: 0 }
  );

  const members = activeMembers().map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    memberNumber: m.memberNumber,
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/meetings"
        className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-dim hover:text-gold transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to meetings
      </Link>

      <div className="rounded-[4px] border border-line bg-surface p-6 sm:p-7">
        <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
          {format(meeting.meetingDate, "PPP · p")}
        </p>
        <h1 className="mt-2 font-syne text-3xl font-bold text-txt sm:text-4xl">
          {meeting.title}
        </h1>
        {meeting.location && (
          <p className="mt-1 font-dm text-sub text-sm">{meeting.location}</p>
        )}
        <div className="mt-5 grid grid-cols-3 gap-3 max-w-xl">
          <div className="rounded-[2px] bg-raised border border-line p-4">
            <p className="font-mono text-[9px] uppercase tracking-widest text-dim">Attendance</p>
            <p className="mt-1 font-syne text-2xl font-bold text-txt">{attendance.length}</p>
          </div>
          <div className="rounded-[2px] bg-raised border border-line p-4">
            <p className="font-mono text-[9px] uppercase tracking-widest text-dim">Total</p>
            <p className="mt-1 font-syne text-2xl font-bold text-gold" data-money>
              {totals.total.toLocaleString()}
            </p>
          </div>
          <div className="rounded-[2px] bg-raised border border-line p-4">
            <p className="font-mono text-[9px] uppercase tracking-widest text-dim">Savings</p>
            <p className="mt-1 font-syne text-2xl font-bold text-growth" data-money>
              {totals.savings.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <MeetingDetailClient
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        members={members}
        initialAttendance={attendance.map((a) => ({
          memberId: a.memberId,
          status: a.status,
        }))}
      />
    </div>
  );
}
