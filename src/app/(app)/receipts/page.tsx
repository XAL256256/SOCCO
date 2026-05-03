import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ReceiptsClient } from "./ReceiptsClient";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  await requireUser();
  const items = await prisma.receipt.findMany({
    orderBy: { issuedAt: "desc" },
    take: 200,
    include: {
      member: {
        select: {
          firstName: true,
          lastName: true,
          memberNumber: true,
          phoneNumber: true,
        },
      },
      contribution: true,
    },
  });
  return <ReceiptsClient initial={items} />;
}
