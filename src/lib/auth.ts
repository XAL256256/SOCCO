import { cache } from "react";
import { cookies } from "next/headers";
import type { Role, User } from "./data/types";
import { getUserByRole, getUserByUsername, getUsers } from "./data/queries";

export const DEMO_ROLE_COOKIE = "nboog_role";

const ALL_ROLES: Role[] = ["ADMIN", "CHAIRPERSON", "TREASURER", "SECRETARY", "AUDITOR"];

function isRole(v: string | undefined): v is Role {
  return !!v && ALL_ROLES.includes(v as Role);
}

export type AuthenticatedUser = User;

export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  try {
    const cookieStore = await cookies();
    const cookieRole = cookieStore.get(DEMO_ROLE_COOKIE)?.value;

    if (isRole(cookieRole)) {
      const u = getUserByRole(cookieRole);
      if (u) return u;
    }

    const chair = getUserByUsername("chair");
    if (chair) return chair;

    return getUsers()[0] ?? null;
  } catch (err) {
    console.error("[getCurrentUser]", err);
    return null;
  }
});

export async function requireUser(): Promise<AuthenticatedUser> {
  const u = await getCurrentUser();
  if (!u) throw new Error("NO_STAFF_USER");
  return u;
}

export async function requireRole(..._allowed: Role[]): Promise<AuthenticatedUser> {
  return requireUser();
}

export async function getRequestContext(): Promise<{
  ip: string | null;
  userAgent: string | null;
}> {
  return { ip: null, userAgent: null };
}
