import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(err: unknown) {
  console.error("[api] unexpected error", err);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return badRequest("Validation failed", err.flatten().fieldErrors);
  }
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") return unauthorized();
    if (err.message === "FORBIDDEN") return forbidden();
    if (err.message === "NO_STAFF_USER") {
      return NextResponse.json(
        {
          error:
            "No staff user in database. Run npm run db:seed against DATABASE_URL.",
        },
        { status: 503 }
      );
    }
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[]) ?? [];
      return badRequest(`Duplicate value for ${target.join(", ")}`);
    }
    if (err.code === "P2025") return notFound("Resource not found");
  }
  return serverError(err);
}
