import { getReceipt } from "@/lib/mock/queries";
import { demoReadOnly, notFound, ok } from "@/lib/api";

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
  return demoReadOnly("Demo mode — receipt edits are not persisted.");
}
