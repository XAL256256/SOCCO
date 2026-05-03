import { getMember } from "@/lib/data/queries";
import { accepted, notFound, ok } from "@/lib/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const member = getMember(id);
  if (!member) return notFound("Member not found");
  return ok(member);
}

export async function PATCH() {
  return accepted({ message: "Update queued" });
}

export async function DELETE() {
  return accepted({ message: "Delete queued" });
}
