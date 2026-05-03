import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { MembersTable } from "@/components/members/MembersTable";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  await requireUser();
  const members = await prisma.member.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: { contributions: true, receipts: true, attendance: true },
      },
    },
  });

  return <MembersTable initial={members} />;
}
