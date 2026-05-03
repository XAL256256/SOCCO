import { demoReadOnly } from "@/lib/api";

export async function POST() {
  return demoReadOnly("Demo mode — attendance is not persisted.");
}
