import { listMembers } from "@/lib/data/queries";
import { accepted, ok } from "@/lib/api";

export async function GET() {
  return ok(listMembers());
}

export async function POST() {
  return accepted({ message: "Member queued" });
}
