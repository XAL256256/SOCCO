import { NextRequest } from "next/server";
import { listReceipts } from "@/lib/data/queries";
import { ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const take = Math.min(Number(req.nextUrl.searchParams.get("take") || 50), 200);
  return ok(listReceipts({ query: q, limit: take }));
}
