import { listContributions } from "@/lib/data/queries";
import { accepted, ok } from "@/lib/api";

export async function GET() {
  return ok(listContributions({ limit: 100 }));
}

export async function POST() {
  return accepted({ message: "Contribution queued" });
}
