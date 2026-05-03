"use client";

import { motion } from "framer-motion";
import { CalendarPlus, MapPin, Users2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MeetingFormModal } from "@/components/meetings/MeetingFormModal";

type Meeting = {
  id: string;
  title: string;
  meetingDate: Date | string;
  location: string | null;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  _count: { attendance: number; contributions: number };
};

const STATUS_STYLES: Record<Meeting["status"], string> = {
  SCHEDULED: "chip-accent",
  IN_PROGRESS: "chip-primary",
  COMPLETED: "chip-secondary",
  CANCELLED: "chip-danger",
};

export function MeetingsClient({
  upcoming,
  past,
}: {
  upcoming: Meeting[];
  past: Meeting[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Meetings
            </h1>
            <p className="text-sm text-gray-500">
              {upcoming.length} upcoming · {past.length} completed
            </p>
          </div>
          <MagneticButton onClick={() => setAdding(true)}>
            <CalendarPlus className="h-4 w-4" />
            Schedule meeting
          </MagneticButton>
        </div>

        {upcoming.length > 0 && (
          <section>
            <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-gray-500">
              Upcoming
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((m, i) => (
                <MeetingCard key={m.id} meeting={m} index={i} variant="upcoming" />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-gray-500">
            History
          </h2>
          {past.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-soft">
              No past meetings yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {past.map((m, i) => (
                <MeetingCard key={m.id} meeting={m} index={i} variant="past" />
              ))}
            </div>
          )}
        </section>
      </div>

      <MeetingFormModal open={adding} onClose={() => setAdding(false)} />
    </>
  );
}

function MeetingCard({
  meeting,
  index,
  variant,
}: {
  meeting: Meeting;
  index: number;
  variant: "upcoming" | "past";
}) {
  const date = new Date(meeting.meetingDate);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={`/meetings/${meeting.id}`}
        className={`group block rounded-[28px] p-6 shadow-elevated transition-all ${
          variant === "upcoming"
            ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:shadow-floating"
            : "bg-white hover:shadow-floating"
        }`}
      >
        <div className="flex items-start justify-between">
          <div
            className={`grid h-14 w-14 place-items-center rounded-2xl text-center ${
              variant === "upcoming"
                ? "bg-white/15 text-white"
                : "bg-primary-50 text-primary-700"
            }`}
          >
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest">
                {format(date, "MMM")}
              </p>
              <p className="font-display text-xl font-bold leading-none">
                {format(date, "d")}
              </p>
            </div>
          </div>
          <span className={STATUS_STYLES[meeting.status]}>{meeting.status}</span>
        </div>

        <h3
          className={`mt-5 font-display text-lg font-bold ${
            variant === "upcoming" ? "text-white" : "text-gray-900"
          }`}
        >
          {meeting.title}
        </h3>
        <p
          className={`text-sm ${
            variant === "upcoming" ? "text-primary-100" : "text-gray-500"
          }`}
        >
          {format(date, "PPp")}
        </p>

        {meeting.location && (
          <p
            className={`mt-3 inline-flex items-center gap-1.5 text-xs ${
              variant === "upcoming" ? "text-primary-100" : "text-gray-500"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            {meeting.location}
          </p>
        )}

        <div
          className={`mt-5 flex items-center justify-between border-t pt-4 text-xs ${
            variant === "upcoming" ? "border-white/15" : "border-gray-100"
          }`}
        >
          <span
            className={`inline-flex items-center gap-1.5 ${
              variant === "upcoming" ? "text-primary-100" : "text-gray-500"
            }`}
          >
            <Users2 className="h-3.5 w-3.5" />
            {meeting._count.attendance} attended
          </span>
          <span
            className={`font-mono ${
              variant === "upcoming" ? "text-white" : "text-gray-700"
            }`}
          >
            {meeting._count.contributions} contributions
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
