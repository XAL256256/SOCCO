import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, HandCoins } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { formatUGX } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContributionsPage() {
  await requireUser();
  const items = await prisma.contribution.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      member: { select: { firstName: true, lastName: true, memberNumber: true } },
      receipt: true,
      meeting: { select: { title: true } },
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Contributions
          </h1>
          <p className="text-sm text-gray-500">
            The last {items.length} contributions across all meetings.
          </p>
        </div>
        <Link href="/contributions/new" className="btn-primary inline-flex">
          <HandCoins className="h-4 w-4" />
          Log contribution
        </Link>
      </div>

      <div className="rounded-[28px] bg-white shadow-elevated overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {items.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6 sm:py-4"
            >
              <Avatar name={`${c.member.firstName} ${c.member.lastName}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {c.member.firstName} {c.member.lastName}
                </p>
                <p className="font-mono text-xs text-gray-500">
                  {c.member.memberNumber} ·{" "}
                  {c.meeting?.title ?? "Direct deposit"} ·{" "}
                  {format(c.createdAt, "PPp")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold">
                  {formatUGX(c.totalAmount)}
                </p>
                {c.receipt && (
                  <Link
                    href={`/receipts#${c.receipt.id}`}
                    className="inline-flex items-center gap-1 text-xs text-primary-700 font-mono"
                  >
                    {c.receipt.receiptNumber}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
        {items.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500">
            No contributions yet.
          </p>
        )}
      </div>
    </div>
  );
}
