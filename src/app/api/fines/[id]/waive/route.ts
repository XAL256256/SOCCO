import { demoReadOnly } from "@/lib/api";

export async function POST() {
  return demoReadOnly("Demo mode — fine waivers are not persisted.");
}
