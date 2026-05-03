import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { MeetingDetailClient } from "./MeetingDetailClient";

export const dynamic = "force-dynamic";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const [meeting, members] = await Promise.all([
    prisma.meeting.findUnique({
      where: { id },
      include: {
        attendance: {
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                memberNumber: true,
              },
            },
          },
        },
        contributions: {
          select: { totalAmount: true, savingsAmount: true, welfareAmount: true },
        },
      },
    }),
    prisma.member.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, memberNumber: true },
    }),
  ]);

  if (!meeting) notFound();

  const totals = meeting.contributions.reduce(
    (a, c) => ({
      total: a.total + c.totalAmount,
      savings: a.savings + c.savingsAmount,
      welfare: a.welfare + c.welfareAmount,
    }),
    { total: 0, savings: 0, welfare: 0 }
  );

  return (
    <div className="space-y-6">
      <Link
        href="/meetings"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to meetings
      </Link>

      <div className="rounded-[32px] bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-floating sm:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-gray-400">
          {format(meeting.meetingDate, "PPP · p")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          {meeting.title}
        </h1>
        {meeting.location && (
          <p className="mt-1 text-sm text-gray-300">{meeting.location}</p>
        )}
        <div className="mt-5 grid grid-cols-3 gap-4 max-w-xl">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
              Attendance
            </p>
            <p className="mt-1 font-display text-2xl font-bold">
              {meeting.attendance.length}
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
              Total
            </p>
            <p className="mt-1 font-display text-2xl font-bold">
              {totals.total.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
              Savings
            </p>
            <p className="mt-1 font-display text-2xl font-bold">
              {totals.savings.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <MeetingDetailClient
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        members={members}
        initialAttendance={meeting.attendance.map((a) => ({
          memberId: a.memberId,
          status: a.status,
        }))}
      />
    </div>
  );
}
