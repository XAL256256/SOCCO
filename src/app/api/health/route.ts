import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    name: "NBOOG SACCO",
    time: new Date().toISOString(),
  });
}
