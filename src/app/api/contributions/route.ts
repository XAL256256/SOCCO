import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getRequestContext, requireRole } from "@/lib/auth";
import { audit, AUDIT_ACTIONS } from "@/lib/audit";
import { contributionSchema } from "@/lib/validators";
import { receiptIntegrityHash } from "@/lib/crypto";
import { generateReceiptNumber } from "@/lib/utils";
import { rateLimit, RATE_LIMITS } from "@/lib/ratelimit";
import { created, handleApiError, ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN", "TREASURER", "SECRETARY", "CHAIRPERSON", "AUDITOR");
    const url = req.nextUrl;
    const memberId = url.searchParams.get("memberId") || undefined;
    const meetingId = url.searchParams.get("meetingId") || undefined;
    const take = Math.min(Number(url.searchParams.get("take") || 50), 200);

    const where: Prisma.ContributionWhereInput = {};
    if (memberId) where.memberId = memberId;
    if (meetingId) where.meetingId = meetingId;

    const items = await prisma.contribution.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      include: {
        member: { select: { firstName: true, lastName: true, memberNumber: true } },
        receipt: true,
      },
    });
    return ok(items);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("ADMIN", "TREASURER", "SECRETARY", "CHAIRPERSON");
    const ctx = await getRequestContext();

    const rl = rateLimit({ key: `receipt:${user.id}`, ...RATE_LIMITS.receipt });
    if (!rl.success) {
      return ok(
        { error: "Slow down — too many receipts in quick succession." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = contributionSchema.safeParse(body);
    if (!parsed.success) return handleApiError(parsed.error);

    const totalAmount =
      parsed.data.welfareAmount +
      parsed.data.savingsAmount +
      parsed.data.loanRepayment +
      parsed.data.fineAmount +
      parsed.data.shareAmount +
      parsed.data.registrationFee +
      parsed.data.otherAmount;

    const result = await prisma.$transaction(async (tx) => {
      // Receipt number scoped per-day: RCT-YYYYMMDD-NNN (per proposal spec).
      const issuedAt = new Date();
      const dayStart = new Date(
        issuedAt.getFullYear(),
        issuedAt.getMonth(),
        issuedAt.getDate()
      );
      const dayEnd = new Date(
        issuedAt.getFullYear(),
        issuedAt.getMonth(),
        issuedAt.getDate(),
        23,
        59,
        59
      );
      const dailyCount = await tx.receipt.count({
        where: { issuedAt: { gte: dayStart, lte: dayEnd } },
      });
      const receiptNumber = generateReceiptNumber(dailyCount + 1, issuedAt);

      const contribution = await tx.contribution.create({
        data: {
          memberId: parsed.data.memberId,
          meetingId: parsed.data.meetingId || null,
          welfareAmount: parsed.data.welfareAmount,
          savingsAmount: parsed.data.savingsAmount,
          loanRepayment: parsed.data.loanRepayment,
          fineAmount: parsed.data.fineAmount,
          shareAmount: parsed.data.shareAmount,
          registrationFee: parsed.data.registrationFee,
          otherAmount: parsed.data.otherAmount,
          otherDescription: parsed.data.otherDescription || null,
          totalAmount,
          paymentMethod: parsed.data.paymentMethod,
          reference: parsed.data.reference || null,
          notes: parsed.data.notes || null,
          loggedById: user.id,
        },
        include: {
          member: {
            select: { firstName: true, lastName: true, memberNumber: true },
          },
        },
      });

      const integrityHash = receiptIntegrityHash({
        receiptNumber,
        memberId: contribution.memberId,
        memberNumber: contribution.member.memberNumber,
        welfare: contribution.welfareAmount,
        savings: contribution.savingsAmount,
        loan: contribution.loanRepayment,
        fine: contribution.fineAmount,
        share: contribution.shareAmount,
        registration: contribution.registrationFee,
        other: contribution.otherAmount,
        total: contribution.totalAmount,
        method: contribution.paymentMethod,
        issuedAt: new Date().toISOString(),
        issuedBy: user.id,
      });

      const receipt = await tx.receipt.create({
        data: {
          receiptNumber,
          contributionId: contribution.id,
          memberId: contribution.memberId,
          totalAmount,
          issuedById: user.id,
          integrityHash,
        },
      });

      // If linked to a meeting, ensure attendance is recorded as PRESENT.
      if (parsed.data.meetingId) {
        await tx.attendance.upsert({
          where: {
            meetingId_memberId: {
              meetingId: parsed.data.meetingId,
              memberId: parsed.data.memberId,
            },
          },
          create: {
            meetingId: parsed.data.meetingId,
            memberId: parsed.data.memberId,
            status: "PRESENT",
          },
          update: {},
        });
      }

      return { contribution, receipt };
    });

    await audit({
      userId: user.id,
      action: AUDIT_ACTIONS.LOG_CONTRIBUTION,
      resource: "Contribution",
      resourceId: result.contribution.id,
      metadata: {
        receiptNumber: result.receipt.receiptNumber,
        totalAmount,
        memberId: result.contribution.memberId,
      },
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return created({
      contribution: result.contribution,
      receipt: result.receipt,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
