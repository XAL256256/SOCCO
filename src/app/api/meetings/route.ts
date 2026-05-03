import { listMeetings } from "@/lib/data/queries";
import { accepted, ok } from "@/lib/api";

export async function GET() {
  return ok(listMeetings());
}

export async function POST() {
  return accepted({ message: "Meeting queued" });
}
