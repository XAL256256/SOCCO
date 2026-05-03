import { isFuture, isToday } from "date-fns";
import { requireUser } from "@/lib/auth";
import { listMeetings } from "@/lib/data/queries";
import { CONTRIBUTIONS } from "@/lib/data/source";
import { MeetingsClient } from "./MeetingsClient";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  await requireUser();
  const meetings = listMeetings().map((m) => ({
    ...m,
    _count: {
      attendance: m._count.attendance,
      contributions: CONTRIBUTIONS.filter((c) => c.meetingId === m.id).length,
    },
  }));

  const upcoming = meetings.filter(
    (m) => isFuture(m.meetingDate) || isToday(m.meetingDate)
  );
  const past = meetings.filter(
    (m) => !isFuture(m.meetingDate) && !isToday(m.meetingDate)
  );

  return <MeetingsClient upcoming={upcoming} past={past} />;
}
