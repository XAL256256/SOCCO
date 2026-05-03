import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { DEMO_ROLE_COOKIE } from "@/lib/auth";

const bodySchema = z.object({
  role: z.nativeEnum(Role).nullable(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const cookieStore = await cookies();

  if (parsed.data.role === null) {
    cookieStore.delete(DEMO_ROLE_COOKIE);
  } else {
    cookieStore.set(DEMO_ROLE_COOKIE, parsed.data.role, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });
  }

  return NextResponse.json({ ok: true });
}
