import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getRequestContext, requireRole, requireUser } from "@/lib/auth";
import { audit, AUDIT_ACTIONS } from "@/lib/audit";
import { memberSchema } from "@/lib/validators";
import { handleApiError, notFound, ok } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();
    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        contributions: {
          orderBy: { createdAt: "desc" },
          take: 30,
          include: { receipt: true },
        },
        attendance: {
          orderBy: { checkedInAt: "desc" },
          take: 30,
          include: { meeting: { select: { title: true, meetingDate: true } } },
        },
      },
    });
    if (!member) return notFound("Member not found");
    return ok(member);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("ADMIN", "TREASURER", "SECRETARY", "CHAIRPERSON");
    const ctx = await getRequestContext();
    const { id } = await params;

    const body = await req.json().catch(() => null);
    const parsed = memberSchema.partial().safeParse(body);
    if (!parsed.success) return handleApiError(parsed.error);

    const updated = await prisma.member.update({
      where: { id },
      data: {
        ...parsed.data,
        nationalId: parsed.data.nationalId || null,
        email: parsed.data.email || null,
        dateOfBirth: parsed.data.dateOfBirth
          ? new Date(parsed.data.dateOfBirth)
          : undefined,
      },
    });

    await audit({
      userId: user.id,
      action: AUDIT_ACTIONS.UPDATE_MEMBER,
      resource: "Member",
      resourceId: id,
      metadata: { changes: Object.keys(parsed.data) },
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("ADMIN");
    const ctx = await getRequestContext();
    const { id } = await params;

    // Soft-delete by status change for financial integrity
    const updated = await prisma.member.update({
      where: { id },
      data: { status: "EXITED" },
    });

    await audit({
      userId: user.id,
      action: AUDIT_ACTIONS.DELETE_MEMBER,
      resource: "Member",
      resourceId: id,
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
