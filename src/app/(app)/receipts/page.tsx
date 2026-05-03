import { requireUser } from "@/lib/auth";
import { listReceipts } from "@/lib/mock/queries";
import { ReceiptsClient } from "./ReceiptsClient";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  await requireUser();
  const items = listReceipts({ limit: 200 }).map((r) => ({
    ...r,
    member: {
      firstName: r.member.firstName,
      lastName: r.member.lastName,
      memberNumber: r.member.memberNumber,
      phoneNumber: r.member.phoneNumber,
    },
  }));
  return <ReceiptsClient initial={items} />;
}
