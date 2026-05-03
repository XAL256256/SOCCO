import { requireUser } from "@/lib/auth";
import { activeMembers, listLoans } from "@/lib/mock/queries";
import { LoansClient } from "./LoansClient";

export const dynamic = "force-dynamic";

export default async function LoansPage() {
  const user = await requireUser();
  const loans = listLoans();
  const members = activeMembers().map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    memberNumber: m.memberNumber,
    phoneNumber: m.phoneNumber,
  }));

  return (
    <LoansClient
      loans={loans.map((l) => ({
        ...l,
        appliedAt: l.appliedAt.toISOString(),
        approvedAt: l.approvedAt?.toISOString() ?? null,
        disbursedAt: l.disbursedAt?.toISOString() ?? null,
        dueAt: l.dueAt?.toISOString() ?? null,
        closedAt: l.closedAt?.toISOString() ?? null,
        schedule: l.schedule.map((s) => ({
          ...s,
          dueDate: s.dueDate.toISOString(),
          paidAt: s.paidAt?.toISOString() ?? null,
        })),
        member: {
          id: l.member.id,
          firstName: l.member.firstName,
          lastName: l.member.lastName,
          memberNumber: l.member.memberNumber,
          phoneNumber: l.member.phoneNumber,
        },
      }))}
      members={members}
      role={user.role}
    />
  );
}
