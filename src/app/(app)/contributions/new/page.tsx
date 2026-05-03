import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ContributionForm } from "./ContributionForm";

export const dynamic = "force-dynamic";

export default async function NewContributionPage() {
  await requireRole("ADMIN", "TREASURER", "SECRETARY", "CHAIRPERSON");

  const [members, meetings, settings] = await Promise.all([
    prisma.member.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, memberNumber: true, phoneNumber: true },
    }),
    prisma.meeting.findMany({
      orderBy: { meetingDate: "desc" },
      take: 10,
      select: { id: true, title: true, meetingDate: true },
    }),
    prisma.setting.findMany({
      where: { key: { in: ["sacco.welfarePerMeeting", "sacco.minSavings"] } },
    }),
  ]);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <ContributionForm
      members={members}
      meetings={meetings.map((m) => ({
        ...m,
        meetingDate: m.meetingDate.toISOString(),
      }))}
      defaults={{
        welfareAmount: Number(settingsMap["sacco.welfarePerMeeting"] || 0),
      }}
    />
  );
}
