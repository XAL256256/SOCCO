import { getMember } from "@/lib/mock/queries";
import { demoReadOnly, notFound, ok } from "@/lib/api";

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
  return demoReadOnly("Demo mode — member updates are not persisted.");
}

export async function DELETE() {
  return demoReadOnly("Demo mode — member deletion is disabled.");
}
