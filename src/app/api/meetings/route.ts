import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getRequestContext, requireRole, requireUser } from "@/lib/auth";
import { audit, AUDIT_ACTIONS } from "@/lib/audit";
import { meetingSchema } from "@/lib/validators";
import { created, handleApiError, ok } from "@/lib/api";

export async function GET() {
  try {
    await requireUser();
    const items = await prisma.meeting.findMany({
      orderBy: { meetingDate: "desc" },
      include: {
        _count: { select: { attendance: true, contributions: true } },
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

    const body = await req.json().catch(() => null);
    const parsed = meetingSchema.safeParse(body);
    if (!parsed.success) return handleApiError(parsed.error);

    const meeting = await prisma.meeting.create({
      data: {
        title: parsed.data.title,
        meetingDate: new Date(parsed.data.meetingDate),
        location: parsed.data.location || null,
        agenda: parsed.data.agenda || null,
        createdById: user.id,
      },
    });

    await audit({
      userId: user.id,
      action: AUDIT_ACTIONS.CREATE_MEETING,
      resource: "Meeting",
      resourceId: meeting.id,
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return created(meeting);
  } catch (e) {
    return handleApiError(e);
  }
}
