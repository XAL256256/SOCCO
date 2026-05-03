import { cache } from "react";
import { cookies, headers } from "next/headers";
import { Role } from "@prisma/client";
import { prisma } from "./db";

/** Cookie for demo / presentation: pick which seeded staff persona appears in the UI. */
export const DEMO_ROLE_COOKIE = "nboog_demo_role";

const ALL_ROLES: Role[] = [
  "ADMIN",
  "CHAIRPERSON",
  "TREASURER",
  "SECRETARY",
  "AUDITOR",
];

function isRole(v: string | undefined): v is Role {
  return !!v && ALL_ROLES.includes(v as Role);
}

export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
};

/**
 * Loads the active persona: optional presentation cookie → matching seeded user,
 * else `chair`, else first staff row. Surfaces DB/env failures as null (no crash digest).
 */
export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  try {
    const cookieStore = await cookies();
    const cookieRole = cookieStore.get(DEMO_ROLE_COOKIE)?.value;

    if (isRole(cookieRole)) {
      const byRole = await prisma.user.findFirst({
        where: { role: cookieRole },
        orderBy: { username: "asc" },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
        },
      });
      if (byRole) return byRole;
    }

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
  } catch (err) {
    console.error("[getCurrentUser]", err);
    return null;
  }
});

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("NO_STAFF_USER");
  }
  return user;
}

/** Kept for API compatibility — uses whichever persona is active (presentation cookie or default). */
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
