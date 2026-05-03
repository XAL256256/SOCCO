import { cache } from "react";
import { headers } from "next/headers";
import { Role } from "@prisma/client";
import { prisma } from "./db";

export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
};

/**
 * Single-operator mode: use `chair` if present, else first seeded staff user.
 * No passwords or sessions — the whole app trusts this identity for auditing.
 */
export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  const preferred = await prisma.user.findFirst({
    where: { username: "chair" },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
    },
  });
  if (preferred) return preferred;

  const fallback = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
    },
  });
  return fallback;
});

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("NO_STAFF_USER");
  }
  return user;
}

/** Role checks retained only for API shape compatibility — always allows the singleton user. */
export async function requireRole(..._allowed: Role[]): Promise<AuthenticatedUser> {
  return requireUser();
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
