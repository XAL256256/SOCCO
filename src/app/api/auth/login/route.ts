import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuditStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";
import { issueAuthCookie, getRequestContext } from "@/lib/auth";
import { rateLimit, RATE_LIMITS } from "@/lib/ratelimit";
import { audit, AUDIT_ACTIONS } from "@/lib/audit";

const bodySchema = z.object({
  identifier: z.string().min(1).max(200),
  password: z.string().min(1).max(200),
});

const MAX_FAILED = 5;
const LOCKOUT_MS = 15 * 60_000;

export async function POST(req: NextRequest) {
  const { ip, userAgent } = await getRequestContext();
  const ipKey = ip ?? "unknown";

  const rl = rateLimit({
    key: `login:${ipKey}`,
    ...RATE_LIMITS.login,
  });
  if (!rl.success) {
    void audit({
      action: AUDIT_ACTIONS.RATE_LIMITED,
      resource: "Auth",
      ipAddress: ip,
      userAgent,
      status: AuditStatus.WARNING,
    });
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) },
      }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { identifier, password } = parsed.data;
  const lower = identifier.trim().toLowerCase();
  const isEmail = lower.includes("@");

  try {
    await prisma.$connect();
  } catch (e) {
    console.error("[login] database unreachable", e);
    return NextResponse.json(
      {
        error:
          "Cannot reach database. Add DATABASE_URL in Vercel and run db push + seed.",
      },
      { status: 503 }
    );
  }

  const generic401 = NextResponse.json(
    { error: "Invalid username or password" },
    { status: 401 }
  );

  let user;
  try {
    user = await prisma.user.findFirst({
      where: isEmail ? { email: lower } : { username: lower },
    });
  } catch (e) {
    console.error("[login] query failed", e);
    return NextResponse.json(
      { error: "Database error during login" },
      { status: 503 }
    );
  }

  if (!user) {
    await verifyPassword(
      password,
      "$2a$12$invalidsaltinvalidsaltinvalidsaltinvalidsa"
    );
    void audit({
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      resource: "Auth",
      metadata: { identifier: lower },
      ipAddress: ip,
      userAgent,
      status: AuditStatus.FAILURE,
    });
    return generic401;
  }

  if (!user.isActive) {
    void audit({
      userId: user.id,
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      resource: "Auth",
      metadata: { reason: "inactive" },
      ipAddress: ip,
      userAgent,
      status: AuditStatus.FAILURE,
    });
    return generic401;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    void audit({
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
          "Account temporarily locked after failed attempts. Try again later.",
      },
      { status: 423 }
    );
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    const failed = user.failedLogins + 1;
    const lock = failed >= MAX_FAILED;
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLogins: failed,
          lockedUntil: lock ? new Date(Date.now() + LOCKOUT_MS) : null,
        },
      });
    } catch (e) {
      console.error("[login] failed-login counter update", e);
    }
    void audit({
      userId: user.id,
      action: lock ? AUDIT_ACTIONS.LOGIN_LOCKED : AUDIT_ACTIONS.LOGIN_FAILED,
      resource: "Auth",
      ipAddress: ip,
      userAgent,
      status: AuditStatus.FAILURE,
    });
    return generic401;
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip ?? null,
      },
    });
  } catch (e) {
    console.error("[login] user update after success", e);
  }

  await issueAuthCookie({
    userId: user.id,
    role: user.role,
    username: user.username,
    userAgent,
    ipAddress: ip,
  });

  void audit({
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
