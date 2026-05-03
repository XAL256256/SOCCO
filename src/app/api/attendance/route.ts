import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getRequestContext, requireRole } from "@/lib/auth";
import { audit, AUDIT_ACTIONS } from "@/lib/audit";
import { attendanceSchema } from "@/lib/validators";
import { handleApiError, ok } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("ADMIN", "TREASURER", "SECRETARY", "CHAIRPERSON");
    const ctx = await getRequestContext();

    const body = await req.json().catch(() => null);
    const parsed = attendanceSchema.safeParse(body);
    if (!parsed.success) return handleApiError(parsed.error);

    const now = new Date();

    // Look up meeting + late-fine settings
    const [meeting, settings] = await Promise.all([
      prisma.meeting.findUnique({
        where: { id: parsed.data.meetingId },
        select: { meetingDate: true },
      }),
      prisma.setting.findMany({
        where: { key: { in: ["sacco.gracePeriodMinutes", "sacco.fineLate"] } },
      }),
    ]);

    const sm = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const grace = Number(sm["sacco.gracePeriodMinutes"] ?? 15);
    const fineAmount = Number(sm["sacco.fineLate"] ?? 10000);

    let status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" = parsed.data.status;
    let lateMinutes = 0;
    if (meeting && status === "PRESENT") {
      const cutoff = new Date(meeting.meetingDate);
      cutoff.setMinutes(cutoff.getMinutes() + grace);
      if (now > cutoff) {
        status = "LATE";
        lateMinutes = Math.max(
          0,
          Math.round((now.getTime() - cutoff.getTime()) / 60000)
        );
      }
    }

    const record = await prisma.$transaction(async (tx) => {
      const a = await tx.attendance.upsert({
        where: {
          meetingId_memberId: {
            meetingId: parsed.data.meetingId,
            memberId: parsed.data.memberId,
          },
        },
        create: {
          meetingId: parsed.data.meetingId,
          memberId: parsed.data.memberId,
          status,
          notes:
            (parsed.data.notes || "") +
            (lateMinutes > 0 ? ` Late by ${lateMinutes} min.` : ""),
          checkedInAt: now,
        },
        update: {
          status,
          notes:
            (parsed.data.notes || "") +
            (lateMinutes > 0 ? ` Late by ${lateMinutes} min.` : ""),
          checkedInAt: now,
        },
      });

      // Auto-fine for lateness (idempotent on attendanceId)
      if (status === "LATE" && fineAmount > 0) {
        const exists = await tx.fine.findUnique({
          where: { attendanceId: a.id },
        });
        if (!exists) {
          await tx.fine.create({
            data: {
              memberId: parsed.data.memberId,
              reason: "LATENESS",
              amount: fineAmount,
              description: `Late by ${lateMinutes} minutes`,
              attendanceId: a.id,
            },
          });
        }
      }
      return a;
    });

    await audit({
      userId: user.id,
      action: AUDIT_ACTIONS.RECORD_ATTENDANCE,
      resource: "Attendance",
      resourceId: record.id,
      metadata: {
        memberId: parsed.data.memberId,
        meetingId: parsed.data.meetingId,
        status,
        lateMinutes,
      },
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return ok({ ...record, lateMinutes });
  } catch (e) {
    return handleApiError(e);
  }
}
