import { NextResponse } from "next/server";
import { destroySession, getCurrentUser, getRequestContext } from "@/lib/auth";
import { audit, AUDIT_ACTIONS } from "@/lib/audit";

export async function POST() {
  const user = await getCurrentUser();
  const { ip, userAgent } = await getRequestContext();

  if (user) {
    await audit({
      userId: user.id,
      action: AUDIT_ACTIONS.LOGOUT,
      resource: "Auth",
      ipAddress: ip,
      userAgent,
    });
  }

  await destroySession();
  return NextResponse.json({ ok: true });
}
