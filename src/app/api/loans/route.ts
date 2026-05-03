import { listLoans } from "@/lib/data/queries";
import { accepted, ok } from "@/lib/api";

export async function GET() {
  return ok(listLoans());
}

export async function POST() {
  return accepted({ message: "Loan application queued" });
}
