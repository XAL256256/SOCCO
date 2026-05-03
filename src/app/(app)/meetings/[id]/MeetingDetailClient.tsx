"use client";

import { motion } from "framer-motion";
import { Check, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { FingerprintScanner } from "@/components/attendance/FingerprintScanner";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  memberNumber: string;
};

type AttendanceMap = Record<string, "PRESENT" | "ABSENT" | "LATE" | "EXCUSED">;

export function MeetingDetailClient({
  meetingId,
  meetingTitle,
  members,
  initialAttendance,
}: {
  meetingId: string;
  meetingTitle: string;
  members: Member[];
  initialAttendance: { memberId: string; status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" }[];
}) {
  const [att, setAtt] = useState<AttendanceMap>(() => {
    const m: AttendanceMap = {};
    initialAttendance.forEach((a) => (m[a.memberId] = a.status));
    return m;
  });
  const [scanning, setScanning] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      members.filter((m) => {
        const hay = `${m.firstName} ${m.lastName} ${m.memberNumber}`.toLowerCase();
        return !q || hay.includes(q.toLowerCase());
      }),
    [members, q]
  );

  const present = Object.values(att).filter((s) => s === "PRESENT").length;

  const mark = async (
    memberId: string,
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  ) => {
    setScanning(memberId);
    try {
      // Brief animation delay for scanner feedback
      await new Promise((r) => setTimeout(r, status === "PRESENT" ? 800 : 100));
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, memberId, status }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to record");
        return;
      }
      setAtt((s) => ({ ...s, [memberId]: status }));
      const member = members.find((m) => m.id === memberId);
      toast.success(
        `${member?.firstName} marked ${status.toLowerCase()}`
      );
    } finally {
      setScanning(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="rounded-[28px] bg-white p-6 shadow-elevated">
          <h2 className="font-display text-lg font-bold uppercase tracking-wider">
            Attendance scanner
          </h2>
          <p className="text-sm text-gray-500">
            Tap a member on the right to record their attendance.
          </p>

          <div className="mt-8 grid place-items-center">
            <FingerprintScanner scanning={!!scanning} />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-secondary-50 p-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-secondary-700">
                Present
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-secondary-700">
                {present}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                Roster
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-gray-700">
                {members.length}
              </p>
            </div>
          </div>

          <Link
            href={`/contributions/new?meetingId=${meetingId}`}
            className="btn-primary mt-6 w-full"
          >
            Log contribution for {meetingTitle.split(" ")[0]}
          </Link>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="rounded-[28px] bg-white p-5 shadow-elevated sm:p-6">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            leadingIcon={<Search className="h-4 w-4" />}
            placeholder="Search member by name or number…"
          />
          <ul className="mt-4 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
            {filtered.map((m, idx) => {
              const status = att[m.id];
              const present = status === "PRESENT";
              const absent = !status || status === "ABSENT";
              return (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-primary-50/50"
                >
                  <Avatar name={`${m.firstName} ${m.lastName}`} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="font-mono text-xs text-gray-500">
                      {m.memberNumber}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => mark(m.id, "PRESENT")}
                      disabled={scanning === m.id}
                      className={`grid h-9 w-9 place-items-center rounded-xl transition-all ${
                        present
                          ? "bg-secondary-500 text-white shadow-glow-green"
                          : "bg-gray-100 text-gray-400 hover:bg-secondary-100 hover:text-secondary-700"
                      }`}
                      aria-label="Present"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => mark(m.id, "ABSENT")}
                      disabled={scanning === m.id}
                      className={`grid h-9 w-9 place-items-center rounded-xl transition-all ${
                        absent && status === "ABSENT"
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                      }`}
                      aria-label="Absent"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
