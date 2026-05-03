import Link from "next/link";
import { format, isFuture, isToday } from "date-fns";
import { CalendarCheck2, Fingerprint } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  await requireUser();

  const meetings = await prisma.meeting.findMany({
    orderBy: { meetingDate: "desc" },
    include: { _count: { select: { attendance: true } } },
    take: 12,
  });

  const upcoming = meetings.find(
    (m) => isFuture(m.meetingDate) || isToday(m.meetingDate)
  );

  const recent = await prisma.attendance.findMany({
    orderBy: { checkedInAt: "desc" },
    take: 12,
    include: {
      member: { select: { firstName: true, lastName: true, memberNumber: true } },
      meeting: { select: { title: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-sm text-gray-500">
          Tap into a meeting to start scanning members.
        </p>
      </div>

      {upcoming ? (
        <Link
          href={`/meetings/${upcoming.id}`}
          className="block rounded-[32px] bg-gradient-to-br from-primary-500 to-primary-700 p-6 text-white shadow-floating sm:p-8 hover:shadow-epic transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
              <Fingerprint className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs uppercase tracking-widest text-primary-100">
                Active meeting
              </p>
              <h2 className="font-display text-2xl font-bold truncate">
                {upcoming.title}
              </h2>
              <p className="text-sm text-primary-100">
                {format(upcoming.meetingDate, "PPp")} ·{" "}
                {upcoming._count.attendance} present
              </p>
            </div>
            <CalendarCheck2 className="hidden sm:block h-6 w-6 text-primary-100" />
          </div>
        </Link>
      ) : (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-soft">
          No upcoming meetings — schedule one to start tracking attendance.
        </p>
      )}

      <div className="rounded-[28px] bg-white p-6 shadow-elevated">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gray-500">
          Recent check-ins
        </h2>
        <ul className="mt-3 divide-y divide-gray-100">
          {recent.map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-3">
              <Avatar
                name={`${a.member.firstName} ${a.member.lastName}`}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {a.member.firstName} {a.member.lastName}
                </p>
                <p className="font-mono text-xs text-gray-500">
                  {a.member.memberNumber} · {a.meeting.title}
                </p>
              </div>
              <span
                className={
                  a.status === "PRESENT"
                    ? "chip-secondary"
                    : a.status === "LATE"
                    ? "chip-accent"
                    : "chip-gray"
                }
              >
                {a.status}
              </span>
            </li>
          ))}
        </ul>
        {recent.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500">
            No check-ins yet.
          </p>
        )}
      </div>
    </div>
  );
}
