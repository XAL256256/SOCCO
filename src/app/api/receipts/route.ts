import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const url = req.nextUrl;
    const q = url.searchParams.get("q")?.trim() ?? "";
    const take = Math.min(Number(url.searchParams.get("take") || 50), 200);

    const where: Prisma.ReceiptWhereInput = {};
    if (q) {
      where.OR = [
        { receiptNumber: { contains: q } },
        { member: { firstName: { contains: q } } },
        { member: { lastName: { contains: q } } },
        { member: { memberNumber: { contains: q } } },
      ];
    }

    const items = await prisma.receipt.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      take,
      include: {
        member: { select: { firstName: true, lastName: true, memberNumber: true, phoneNumber: true } },
        contribution: true,
      },
    });
    return ok(items);
  } catch (e) {
    return handleApiError(e);
  }
}
