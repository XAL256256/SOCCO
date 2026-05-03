import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ApprovalsClient } from "./ApprovalsClient";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const user = await requireUser();

  const [pendingLoans, outstandingFines] = await Promise.all([
    prisma.loan.findMany({
      where: { status: "PENDING" },
      orderBy: { appliedAt: "asc" },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberNumber: true,
            phoneNumber: true,
          },
        },
      },
    }),
    prisma.fine.findMany({
      where: { status: "OUTSTANDING" },
      orderBy: { createdAt: "desc" },
      include: {
        member: {
          select: { firstName: true, lastName: true, memberNumber: true },
        },
      },
    }),
  ]);

  return (
    <ApprovalsClient
      role={user.role}
      pendingLoans={pendingLoans.map((l) => ({
        ...l,
        appliedAt: l.appliedAt.toISOString(),
      }))}
      outstandingFines={outstandingFines.map((f) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
      }))}
    />
  );
}
