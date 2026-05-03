import { getReceipt } from "@/lib/data/queries";
import { accepted, notFound, ok } from "@/lib/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const r = getReceipt(id);
  if (!r) return notFound("Receipt not found");
  return ok(r);
}

export async function PATCH() {
  return accepted({ message: "Update queued" });
}
