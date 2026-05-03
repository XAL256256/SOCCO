import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getRequestContext, requireRole, requireUser } from "@/lib/auth";
import { audit, AUDIT_ACTIONS } from "@/lib/audit";
import { checkLoanEligibility, nextLoanNumber } from "@/lib/loans";
import { created, handleApiError, ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const status = req.nextUrl.searchParams.get("status") ?? undefined;
    const where = status ? { status: status as never } : undefined;
    const items = await prisma.loan.findMany({
      where,
      orderBy: { appliedAt: "desc" },
      include: {
        member: {
          select: { firstName: true, lastName: true, memberNumber: true, phoneNumber: true },
        },
        schedule: { orderBy: { dueDate: "asc" } },
      },
    });
    return ok(items);
  } catch (e) {
    return handleApiError(e);
  }
}

const applicationSchema = z.object({
  memberId: z.string().min(1),
  requestedAmount: z.coerce.number().int().min(1),
  termMonths: z.coerce.number().int().min(1).max(60),
  purpose: z.string().min(2).max(200),
  guarantors: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("ADMIN", "TREASURER", "SECRETARY", "CHAIRPERSON");
    const ctx = await getRequestContext();
    const body = await req.json().catch(() => null);
    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) return handleApiError(parsed.error);

    // Pull settings
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["sacco.minMembershipMonths", "sacco.maxLoanMultiplier", "sacco.defaultLoanRate"] } },
    });
    const sm = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    const eligibility = await checkLoanEligibility(
      parsed.data.memberId,
      parsed.data.requestedAmount,
      {
        minMembershipMonths: Number(sm["sacco.minMembershipMonths"] ?? 3),
        maxLoanMultiplier: Number(sm["sacco.maxLoanMultiplier"] ?? 2),
      }
    );

    const loanNumber = await nextLoanNumber(new Date().getFullYear());

    const loan = await prisma.loan.create({
      data: {
        loanNumber,
        memberId: parsed.data.memberId,
        principalAmount: parsed.data.requestedAmount,
        requestedAmount: parsed.data.requestedAmount,
        interestRate: Number(sm["sacco.defaultLoanRate"] ?? 0.10),
        termMonths: parsed.data.termMonths,
        purpose: parsed.data.purpose,
        guarantors: parsed.data.guarantors || null,
        notes: parsed.data.notes || null,
        status: "PENDING",
      },
    });

    await audit({
      userId: user.id,
      action: "CREATE_LOAN_APPLICATION",
      resource: "Loan",
      resourceId: loan.id,
      metadata: {
        loanNumber,
        eligibility: { ok: eligibility.ok, reasons: eligibility.reasons },
      },
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return created({ loan, eligibility });
  } catch (e) {
    return handleApiError(e);
  }
}
