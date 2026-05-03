import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getRequestContext, requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { handleApiError, ok } from "@/lib/api";

const schema = z.object({
  reason: z.string().min(2).max(300),
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

    const updated = await prisma.fine.update({
      where: { id },
      data: {
        status: "WAIVED",
        waivedAt: new Date(),
        waivedById: user.id,
        waivedReason: parsed.data.reason,
      },
    });

    await audit({
      userId: user.id,
      action: "WAIVE_FINE",
      resource: "Fine",
      resourceId: id,
      metadata: { reason: parsed.data.reason },
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
