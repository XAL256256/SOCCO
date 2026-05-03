import { accepted } from "@/lib/api";

export async function POST() {
  return accepted({ message: "Attendance queued" });
}
