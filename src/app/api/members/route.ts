import { listMembers } from "@/lib/mock/queries";
import { demoReadOnly, ok } from "@/lib/api";

export async function GET() {
  return ok(listMembers());
}

export async function POST() {
  return demoReadOnly("Demo mode — member changes are not persisted.");
}
