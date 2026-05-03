import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getRequestContext, requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { handleApiError, ok } from "@/lib/api";
import { receiptIntegrityHash } from "@/lib/crypto";

const editSchema = z.object({
  changedField: z.enum([
    "welfareAmount",
    "savingsAmount",
    "loanRepayment",
    "fineAmount",
    "shareAmount",
    "registrationFee",
    "otherAmount",
  ]),
  newValue: z.coerce.number().int().min(0),
  reason: z.string().min(2).max(300),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN", "TREASURER", "SECRETARY", "CHAIRPERSON", "AUDITOR");
    const { id } = await params;
    const r = await prisma.receipt.findUnique({
      where: { id },
      include: {
        contribution: { include: { member: true, meeting: true, loggedBy: true } },
        member: true,
        issuedBy: true,
        versions: { orderBy: { changedAt: "desc" } },
      },
    });
    if (!r) return handleApiError(new Error("UNKNOWN_RECEIPT"));
    return ok(r);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("ADMIN", "CHAIRPERSON");
    const ctx = await getRequestContext();
    const { id } = await params;

    const body = await req.json().catch(() => null);
    const parsed = editSchema.safeParse(body);
    if (!parsed.success) return handleApiError(parsed.error);

    const result = await prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.findUnique({
        where: { id },
        include: { contribution: true },
      });
      if (!receipt) throw new Error("UNKNOWN_RECEIPT");
      if (receipt.voided) throw new Error("RECEIPT_VOIDED");

      const oldValue = (receipt.contribution as unknown as Record<string, number>)[
        parsed.data.changedField
      ];

      // Snapshot previous state
      await tx.receiptVersion.create({
        data: {
          receiptId: id,
          version: receipt.version,
          snapshot: JSON.stringify({
            receipt,
            contribution: receipt.contribution,
          }),
          changedField: parsed.data.changedField,
          oldValue: String(oldValue),
          newValue: String(parsed.data.newValue),
          reason: parsed.data.reason,
          changedById: user.id,
        },
      });

      // Apply the change to the contribution
      const updatedContribution = await tx.contribution.update({
        where: { id: receipt.contributionId },
        data: { [parsed.data.changedField]: parsed.data.newValue },
      });

      const newTotal =
        updatedContribution.welfareAmount +
        updatedContribution.savingsAmount +
        updatedContribution.loanRepayment +
        updatedContribution.fineAmount +
        updatedContribution.shareAmount +
        updatedContribution.registrationFee +
        updatedContribution.otherAmount;

      await tx.contribution.update({
        where: { id: receipt.contributionId },
        data: { totalAmount: newTotal },
      });

      const newHash = receiptIntegrityHash({
        ...updatedContribution,
        receiptNumber: receipt.receiptNumber,
        memberId: receipt.memberId,
        version: receipt.version + 1,
        total: newTotal,
      });

      const updatedReceipt = await tx.receipt.update({
        where: { id },
        data: {
          version: { increment: 1 },
          totalAmount: newTotal,
          integrityHash: newHash,
        },
      });

      return updatedReceipt;
    });

    await audit({
      userId: user.id,
      action: "EDIT_RECEIPT",
      resource: "Receipt",
      resourceId: id,
      metadata: {
        changedField: parsed.data.changedField,
        newValue: parsed.data.newValue,
        reason: parsed.data.reason,
      },
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return ok(result);
  } catch (e) {
    return handleApiError(e);
  }
}
