import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { Role } from "@prisma/client";
import { prisma } from "./db";
import { env } from "./env";
import { jwtSigningKey } from "./jwt-secret";
import { sha256 } from "./crypto";

const COOKIE_NAME = () => env.SESSION_COOKIE_NAME;
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
  const key = await jwtSigningKey();
  return new SignJWT({ role: payload.role, username: payload.username })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setJti(payload.jti)
    .setIssuer(ISS)
    .setAudience(AUD)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(key);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const key = await jwtSigningKey();
    const { payload } = await jwtVerify(token, key, {
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

/**
 * Stateless JWT in httpOnly cookie. Session row is optional (best-effort)
 * so login still works if that insert fails.
 */
export async function issueAuthCookie(opts: {
  userId: string;
  role: Role;
  username: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}): Promise<void> {
  const jti = crypto.randomUUID();
  const token = await signSession({
    sub: opts.userId,
    jti,
    role: opts.role,
    username: opts.username,
  });

  try {
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
  } catch (e) {
    console.error("[auth] session row skipped (login continues)", e);
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME(), token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME())?.value;
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
  cookieStore.delete(COOKIE_NAME());
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
  const token = cookieStore.get(COOKIE_NAME())?.value;
  if (!token) return null;

  const claims = await verifySession(token);
  if (!claims) return null;

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  });

  if (!user?.isActive) return null;

  const sess = await prisma.session.findUnique({
    where: { id: claims.jti },
    select: { revokedAt: true, expiresAt: true, tokenHash: true },
  });

  if (sess) {
    if (sess.revokedAt) return null;
    if (sess.expiresAt < new Date()) return null;
    if (sess.tokenHash !== sha256(token)) return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
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
