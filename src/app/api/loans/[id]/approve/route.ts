import { demoReadOnly } from "@/lib/api";

export async function POST() {
  return demoReadOnly("Demo mode — loan approval is not persisted.");
}
