import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";
import { createSession, getRequestContext } from "@/lib/auth";
import { rateLimit, RATE_LIMITS } from "@/lib/ratelimit";
import { audit, AUDIT_ACTIONS } from "@/lib/audit";
import { loginSchema } from "@/lib/validators";
import { AuditStatus } from "@prisma/client";

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req: NextRequest) {
  const { ip, userAgent } = await getRequestContext();
  const ipKey = ip ?? "unknown";

  const rl = rateLimit({
    key: `login:${ipKey}`,
    ...RATE_LIMITS.login,
  });
  if (!rl.success) {
    await audit({
      action: AUDIT_ACTIONS.RATE_LIMITED,
      resource: "Auth",
      ipAddress: ip,
      userAgent,
      status: AuditStatus.WARNING,
    });
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { identifier, password } = parsed.data;
  const isEmail = identifier.includes("@");

  const user = await prisma.user.findFirst({
    where: isEmail
      ? { email: identifier.toLowerCase() }
      : { username: identifier.toLowerCase() },
  });

  // Generic error to avoid user enumeration. Always return identical timing.
  const generic = NextResponse.json(
    { error: "Invalid credentials" },
    { status: 401 }
  );

  if (!user) {
    // Burn time to keep timing closer to the success path.
    await verifyPassword(password, "$2a$12$invalidsaltinvalidsaltinvalidsaltinvalidsa");
    await audit({
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      resource: "Auth",
      metadata: { identifier },
      ipAddress: ip,
      userAgent,
      status: AuditStatus.FAILURE,
    });
    return generic;
  }

  if (!user.isActive) {
    await audit({
      userId: user.id,
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      resource: "Auth",
      metadata: { reason: "account_disabled" },
      ipAddress: ip,
      userAgent,
      status: AuditStatus.FAILURE,
    });
    return generic;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await audit({
      userId: user.id,
      action: AUDIT_ACTIONS.LOGIN_LOCKED,
      resource: "Auth",
      ipAddress: ip,
      userAgent,
      status: AuditStatus.WARNING,
    });
    return NextResponse.json(
      {
        error:
          "Account temporarily locked due to too many failed attempts. Try again later.",
      },
      { status: 423 }
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const failedLogins = user.failedLogins + 1;
    const shouldLock = failedLogins >= MAX_FAILED_LOGINS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
          : null,
      },
    });
    await audit({
      userId: user.id,
      action: shouldLock
        ? AUDIT_ACTIONS.LOGIN_LOCKED
        : AUDIT_ACTIONS.LOGIN_FAILED,
      resource: "Auth",
      ipAddress: ip,
      userAgent,
      status: AuditStatus.FAILURE,
    });
    return generic;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLogins: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: ip ?? null,
    },
  });

  await createSession({
    userId: user.id,
    role: user.role,
    username: user.username,
    userAgent,
    ipAddress: ip,
  });

  await audit({
    userId: user.id,
    action: AUDIT_ACTIONS.LOGIN_SUCCESS,
    resource: "Auth",
    ipAddress: ip,
    userAgent,
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    },
  });
}
