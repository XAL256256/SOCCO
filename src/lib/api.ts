import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function demoReadOnly(message = "Demo mode — connect a database to enable writes") {
  return NextResponse.json({ ok: true, demo: true, message }, { status: 200 });
}

export function serverError(err: unknown) {
  console.error("[api] unexpected error", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return badRequest("Validation failed", err.flatten().fieldErrors);
  }
  return serverError(err);
}
