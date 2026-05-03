import { isFuture, isToday } from "date-fns";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { MeetingsClient } from "./MeetingsClient";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  await requireUser();
  const meetings = await prisma.meeting.findMany({
    orderBy: { meetingDate: "desc" },
    include: { _count: { select: { attendance: true, contributions: true } } },
  });

  const upcoming = meetings.filter(
    (m) => isFuture(m.meetingDate) || isToday(m.meetingDate)
  );
  const past = meetings.filter(
    (m) => !isFuture(m.meetingDate) && !isToday(m.meetingDate)
  );

  return <MeetingsClient upcoming={upcoming} past={past} />;
}
