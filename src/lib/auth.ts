import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { Role } from "@prisma/client";
import { prisma } from "./db";
import { env } from "./env";
import { sha256 } from "./crypto";

// Lazy constants — evaluated on first request, not at module load / build time
const getSecret = () => new TextEncoder().encode(env.JWT_SECRET);
const getCookie = () => env.SESSION_COOKIE_NAME;
const ISS = "nboog-sacco";
const AUD = "nboog-sacco-app";
const SESSION_DURATION_DAYS = 7;

export type SessionPayload = {
  sub: string;
  jti: string;
  role: Role;
  username: string;
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, username: payload.username })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setJti(payload.jti)
    .setIssuer(ISS)
    .setAudience(AUD)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISS,
      audience: AUD,
      algorithms: ["HS256"],
    });
    if (
      typeof payload.sub !== "string" ||
      typeof payload.jti !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.username !== "string"
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      jti: payload.jti,
      role: payload.role as Role,
      username: payload.username,
    };
  } catch {
    return null;
  }
}

export async function createSession(opts: {
  userId: string;
  role: Role;
  username: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}): Promise<string> {
  const jti = crypto.randomUUID();
  const token = await signSession({
    sub: opts.userId,
    jti,
    role: opts.role,
    username: opts.username,
  });

  await prisma.session.create({
    data: {
      id: jti,
      userId: opts.userId,
      tokenHash: sha256(token),
      userAgent: opts.userAgent ?? null,
      ipAddress: opts.ipAddress ?? null,
      expiresAt: new Date(
        Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
      ),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(getCookie(), token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookie())?.value;
  if (token) {
    const decoded = await verifySession(token);
    if (decoded?.jti) {
      await prisma.session
        .update({
          where: { id: decoded.jti },
          data: { revokedAt: new Date() },
        })
        .catch(() => undefined);
    }
  }
  cookieStore.delete(getCookie());
}

export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
};

export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookie())?.value;
  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  const dbSession = await prisma.session.findUnique({
    where: { id: session.jti },
    select: {
      revokedAt: true,
      expiresAt: true,
      tokenHash: true,
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
        },
      },
    },
  });

  if (!dbSession) return null;
  if (dbSession.revokedAt) return null;
  if (dbSession.expiresAt < new Date()) return null;
  if (dbSession.tokenHash !== sha256(token)) return null;
  if (!dbSession.user.isActive) return null;

  return {
    id: dbSession.user.id,
    username: dbSession.user.username,
    email: dbSession.user.email,
    fullName: dbSession.user.fullName,
    role: dbSession.user.role,
  };
});

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(...allowed: Role[]): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function getRequestContext(): Promise<{
  ip: string | null;
  userAgent: string | null;
}> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0].trim() ??
    h.get("x-real-ip") ??
    null;
  return { ip, userAgent: h.get("user-agent") };
}
