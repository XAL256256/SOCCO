import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getRequestContext, requireRole, requireUser } from "@/lib/auth";
import { audit, AUDIT_ACTIONS } from "@/lib/audit";
import { memberSchema } from "@/lib/validators";
import { generateMemberNumber } from "@/lib/utils";
import { rateLimit, RATE_LIMITS } from "@/lib/ratelimit";
import {
  created,
  handleApiError,
  ok,
  unauthorized,
} from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const url = req.nextUrl;
    const q = url.searchParams.get("q")?.trim() || "";
    const status = url.searchParams.get("status") || undefined;
    const take = Math.min(Number(url.searchParams.get("take") || 50), 200);
    const skip = Math.max(Number(url.searchParams.get("skip") || 0), 0);

    const rl = rateLimit({ key: `api:${user.id}`, ...RATE_LIMITS.api });
    if (!rl.success) return unauthorized("Too many requests");

    const where: Prisma.MemberWhereInput = {};
    if (q) {
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { phoneNumber: { contains: q } },
        { memberNumber: { contains: q } },
        { email: { contains: q } },
      ];
    }
    if (status && status !== "ALL") {
      where.status = status as Prisma.MemberWhereInput["status"];
    }

    const [items, total] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take,
        skip,
        include: {
          _count: {
            select: { contributions: true, receipts: true, attendance: true },
          },
        },
      }),
      prisma.member.count({ where }),
    ]);

    return ok({ items, total, take, skip });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("ADMIN", "TREASURER", "SECRETARY", "CHAIRPERSON");
    const ctx = await getRequestContext();

    const body = await req.json().catch(() => null);
    const parsed = memberSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const count = await prisma.member.count();
    const memberNumber = generateMemberNumber(count + 1);

    const created_ = await prisma.member.create({
      data: {
        memberNumber,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phoneNumber: parsed.data.phoneNumber,
        nationalId: parsed.data.nationalId || null,
        email: parsed.data.email || null,
        dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
        gender: parsed.data.gender,
        occupation: parsed.data.occupation || null,
        address: parsed.data.address || null,
        nextOfKin: parsed.data.nextOfKin || null,
        nextOfKinPhone: parsed.data.nextOfKinPhone || null,
        notes: parsed.data.notes || null,
      },
    });

    await audit({
      userId: user.id,
      action: AUDIT_ACTIONS.CREATE_MEMBER,
      resource: "Member",
      resourceId: created_.id,
      metadata: { memberNumber },
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return created(created_);
  } catch (e) {
    return handleApiError(e);
  }
}
