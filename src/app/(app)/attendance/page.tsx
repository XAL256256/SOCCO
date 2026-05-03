import Link from "next/link";
import { format, isFuture, isToday } from "date-fns";
import { CalendarCheck2, Fingerprint } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listMeetings } from "@/lib/data/queries";
import { ATTENDANCE, MEETINGS, MEMBERS } from "@/lib/data/source";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, { dot: string; text: string }> = {
  PRESENT: { dot: "#2DC98A", text: "text-growth" },
  LATE:    { dot: "#E8A838", text: "text-gold" },
  ABSENT:  { dot: "#E05454", text: "text-danger" },
  EXCUSED: { dot: "#4A5268", text: "text-dim" },
};

function Initials({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-[2px] bg-gold-dim border border-gold-bd flex items-center justify-center flex-shrink-0">
      <span className="font-syne font-bold text-gold text-[10px]">
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </span>
    </div>
  );
}

export default async function AttendancePage() {
  await requireUser();

  const meetings = listMeetings().slice(0, 12);
  const upcoming = meetings.find(
    (m) => isFuture(m.meetingDate) || isToday(m.meetingDate)
  );

  const recent = ATTENDANCE.slice()
    .sort((a, b) => b.checkedInAt.getTime() - a.checkedInAt.getTime())
    .slice(0, 20)
    .map((a) => ({
      ...a,
      member: MEMBERS.find((m) => m.id === a.memberId)!,
      meeting: MEETINGS.find((m) => m.id === a.meetingId)!,
    }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-syne text-2xl font-bold text-txt">Attendance</h1>
        <p className="font-mono text-[10px] text-dim tracking-widest uppercase mt-1">
          Tap into a meeting to start scanning members
        </p>
      </div>

      {/* Active / upcoming meeting CTA */}
      {upcoming ? (
        <Link
          href={`/meetings/${upcoming.id}`}
          className="flex items-center gap-4 rounded-[4px] border border-gold-bd bg-gold-dim p-5 hover:-translate-y-0.5 transition-all group"
        >
          <div className="grid h-12 w-12 place-items-center rounded-[2px] bg-gold text-bg flex-shrink-0">
            <Fingerprint className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-widest text-gold opacity-70">
              Active meeting
            </p>
            <h2 className="font-syne text-lg font-bold text-txt truncate">{upcoming.title}</h2>
            <p className="font-mono text-xs text-sub mt-0.5">
              {format(upcoming.meetingDate, "PPp")} &middot; {upcoming._count.attendance} present
            </p>
          </div>
          <CalendarCheck2 className="hidden sm:block h-5 w-5 text-gold opacity-60 group-hover:opacity-100 transition-opacity" />
        </Link>
      ) : (
        <div className="rounded-[4px] border border-line bg-surface p-5 text-center">
          <p className="font-mono text-[10px] text-dim tracking-widest uppercase">
            No upcoming meetings — schedule one to start tracking attendance
          </p>
        </div>
      )}

      {/* Recent check-ins */}
      <div className="bg-surface border border-line rounded-[4px] overflow-hidden">
        <div className="px-5 py-4 border-b border-line">
          <p className="font-mono text-[10px] text-dim tracking-[0.12em] uppercase mb-0.5">
            Recent check-ins
          </p>
          <p className="font-dm text-sub text-xs">Last {recent.length} records</p>
        </div>

        {recent.length === 0 ? (
          <p className="py-12 text-center font-mono text-[10px] text-dim tracking-widest uppercase">
            No check-ins yet.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((a) => {
              const s = STATUS_MAP[a.status] ?? STATUS_MAP.ABSENT;
              return (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-raised transition-colors">
                  <Initials name={`${a.member.firstName} ${a.member.lastName}`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-dm text-sm text-txt truncate">
                      {a.member.firstName} {a.member.lastName}
                    </p>
                    <p className="font-mono text-[9px] text-dim">
                      {a.member.memberNumber} &middot; {a.meeting.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                    <span className={`font-mono text-[9px] tracking-widest uppercase ${s.text}`}>
                      {a.status}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
