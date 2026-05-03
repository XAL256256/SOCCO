import { format } from "date-fns";
import { ArrowUpRight, FileText, Wallet2 } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { formatUGX } from "@/lib/utils";
import { LoansClient } from "./LoansClient";

export const dynamic = "force-dynamic";

export default async function LoansPage() {
  const user = await requireUser();
  const [loans, members] = await Promise.all([
    prisma.loan.findMany({
      orderBy: { appliedAt: "desc" },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true, memberNumber: true, phoneNumber: true },
        },
        schedule: { orderBy: { dueDate: "asc" } },
      },
    }),
    prisma.member.findMany({
      where: { status: "ACTIVE" },
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true, memberNumber: true, phoneNumber: true },
    }),
  ]);

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
      }))}
      members={members}
      role={user.role}
    />
  );
}
