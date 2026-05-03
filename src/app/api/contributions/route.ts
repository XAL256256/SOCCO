import { listContributions } from "@/lib/mock/queries";
import { demoReadOnly, ok } from "@/lib/api";

export async function GET() {
  return ok(listContributions({ limit: 100 }));
}

export async function POST() {
  return demoReadOnly("Demo mode — contributions are not persisted.");
}
