import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getRequestContext, requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { computeRepaymentSchedule } from "@/lib/loans";
import { handleApiError, ok } from "@/lib/api";

const schema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  approvedAmount: z.coerce.number().int().min(0).optional(),
  rejectedReason: z.string().max(500).optional().or(z.literal("")),
  disburse: z.boolean().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("ADMIN", "CHAIRPERSON");
    const ctx = await getRequestContext();
    const { id } = await params;

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return handleApiError(parsed.error);

    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) return handleApiError(new Error("UNKNOWN_LOAN"));

    if (parsed.data.action === "REJECT") {
      const updated = await prisma.loan.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectedReason: parsed.data.rejectedReason || null,
          approvedAt: new Date(),
          approvedById: user.id,
        },
      });
      await audit({
        userId: user.id,
        action: "REJECT_LOAN",
        resource: "Loan",
        resourceId: id,
        metadata: { reason: parsed.data.rejectedReason },
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
      });
      return ok(updated);
    }

    // Approve (and optionally disburse)
    const principal = parsed.data.approvedAmount ?? loan.requestedAmount;
    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const data = {
        status: parsed.data.disburse ? "DISBURSED" : "APPROVED",
        principalAmount: principal,
        approvedAt: now,
        approvedById: user.id,
        disbursedAt: parsed.data.disburse ? now : null,
        dueAt: new Date(now.getFullYear(), now.getMonth() + loan.termMonths, now.getDate()),
      } as const;
      const u = await tx.loan.update({ where: { id }, data });

      // Generate schedule on approve (so chairperson + treasurer can see it)
      await tx.loanInstallment.deleteMany({ where: { loanId: id } });
      const schedule = computeRepaymentSchedule(
        principal,
        loan.interestRate,
        loan.termMonths,
        now
      );
      for (const s of schedule) {
        await tx.loanInstallment.create({
          data: {
            loanId: id,
            dueDate: s.dueDate,
            amount: s.amount,
          },
        });
      }
      return u;
    });

    await audit({
      userId: user.id,
      action: parsed.data.disburse ? "DISBURSE_LOAN" : "APPROVE_LOAN",
      resource: "Loan",
      resourceId: id,
      metadata: { principal, termMonths: loan.termMonths },
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
