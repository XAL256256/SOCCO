import { listLoans } from "@/lib/mock/queries";
import { demoReadOnly, ok } from "@/lib/api";

export async function GET() {
  return ok(listLoans());
}

export async function POST() {
  return demoReadOnly("Demo mode — loan applications are not persisted.");
}
