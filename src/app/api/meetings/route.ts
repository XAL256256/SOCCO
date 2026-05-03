import { listMeetings } from "@/lib/mock/queries";
import { demoReadOnly, ok } from "@/lib/api";

export async function GET() {
  return ok(listMeetings());
}

export async function POST() {
  return demoReadOnly("Demo mode — meetings are not persisted.");
}
