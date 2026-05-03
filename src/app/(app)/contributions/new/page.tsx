import { requireUser } from "@/lib/auth";
import { activeMembers, listMeetings, listSettings } from "@/lib/mock/queries";
import { ContributionForm } from "./ContributionForm";

export const dynamic = "force-dynamic";

export default async function NewContributionPage() {
  await requireUser();

  const members = activeMembers().map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    memberNumber: m.memberNumber,
    phoneNumber: m.phoneNumber,
  }));

  const meetings = listMeetings()
    .slice(0, 10)
    .map((m) => ({
      id: m.id,
      title: m.title,
      meetingDate: m.meetingDate.toISOString(),
    }));

  const settingsMap = Object.fromEntries(
    listSettings().map((s) => [s.key, s.value])
  );

  return (
    <ContributionForm
      members={members}
      meetings={meetings}
      defaults={{
        welfareAmount: Number(settingsMap["sacco.welfarePerMeeting"] || 30000),
      }}
    />
  );
}
