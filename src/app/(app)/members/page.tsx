import { requireUser } from "@/lib/auth";
import { listMembers } from "@/lib/mock/queries";
import { MembersTable } from "@/components/members/MembersTable";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  await requireUser();
  const members = listMembers();
  return <MembersTable initial={members} />;
}
