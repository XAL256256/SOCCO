import { requireUser } from "@/lib/auth";
import { listFines, listLoans } from "@/lib/mock/queries";
import { ApprovalsClient } from "./ApprovalsClient";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const user = await requireUser();

  const pendingLoans = listLoans()
    .filter((l) => l.status === "PENDING")
    .sort((a, b) => a.appliedAt.getTime() - b.appliedAt.getTime())
    .map((l) => ({
      ...l,
      appliedAt: l.appliedAt.toISOString(),
      member: {
        firstName: l.member.firstName,
        lastName: l.member.lastName,
        memberNumber: l.member.memberNumber,
        phoneNumber: l.member.phoneNumber,
      },
    }));

  const outstandingFines = listFines({ status: "OUTSTANDING" }).map((f) => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
    member: {
      firstName: f.member.firstName,
      lastName: f.member.lastName,
      memberNumber: f.member.memberNumber,
    },
  }));

  return (
    <ApprovalsClient
      role={user.role}
      pendingLoans={pendingLoans}
      outstandingFines={outstandingFines}
    />
  );
}
