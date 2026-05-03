"use client";

import { motion } from "framer-motion";
import { FileText, Phone, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MemberFormModal } from "./MemberFormModal";

type Member = {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXITED";
  occupation: string | null;
  _count: { contributions: number; receipts: number; attendance: number };
};

const STATUS_STYLES: Record<Member["status"], string> = {
  ACTIVE: "chip-secondary",
  INACTIVE: "chip-gray",
  SUSPENDED: "chip-accent",
  EXITED: "chip-danger",
};

export function MembersTable({ initial }: { initial: Member[] }) {
  const [items, setItems] = useState<Member[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | Member["status"]>("ALL");
  const [adding, setAdding] = useState(false);

  useEffect(() => setItems(initial), [initial]);

  const filtered = useMemo(() => {
    return items.filter((m) => {
      if (status !== "ALL" && m.status !== status) return false;
      if (!q) return true;
      const hay = `${m.firstName} ${m.lastName} ${m.phoneNumber} ${m.memberNumber} ${m.email ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [items, q, status]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Members
            </h1>
            <p className="text-sm text-gray-500">
              {items.length} registered · {items.filter((i) => i.status === "ACTIVE").length} active
            </p>
          </div>
          <MagneticButton onClick={() => setAdding(true)}>
            <UserPlus className="h-4 w-4" />
            Add member
          </MagneticButton>
        </div>

        <div className="rounded-[28px] bg-white p-4 shadow-elevated sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                leadingIcon={<Search className="h-4 w-4" />}
                placeholder="Search by name, number, or phone…"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto rounded-2xl bg-gray-100 p-1">
              {(["ALL", "ACTIVE", "INACTIVE", "SUSPENDED", "EXITED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`relative rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    status === s
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {status === s && (
                    <motion.span
                      layoutId="status-pill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-glow"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {filtered.map((m) => (
            <Link
              key={m.id}
              href={`/members/${m.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft active:scale-[0.99] transition-transform"
            >
              <Avatar name={`${m.firstName} ${m.lastName}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold">
                    {m.firstName} {m.lastName}
                  </p>
                  <span className={STATUS_STYLES[m.status]}>{m.status}</span>
                </div>
                <p className="font-mono text-xs text-gray-500">
                  {m.memberNumber} · {m.phoneNumber}
                </p>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500">
              No members match your filters.
            </p>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-[28px] bg-white shadow-elevated sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Member
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Contact
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Activity
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Report
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, idx) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ backgroundColor: "#fef4ee" }}
                  className="border-b border-gray-50 last:border-none cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/members/${m.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar name={`${m.firstName} ${m.lastName}`} />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {m.firstName} {m.lastName}
                        </p>
                        <p className="font-mono text-xs text-gray-500">
                          {m.memberNumber}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`tel:${m.phoneNumber}`}
                      className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-primary-700"
                    >
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      {m.phoneNumber}
                    </a>
                    {m.email && (
                      <p className="text-xs text-gray-500">{m.email}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <p>
                      <span className="font-mono font-semibold">
                        {m._count.contributions}
                      </span>{" "}
                      contributions
                    </p>
                    <p className="text-xs text-gray-500">
                      {m._count.attendance} meetings attended
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={STATUS_STYLES[m.status]}>{m.status}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/members/${m.id}/statement`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
                      title="Open member statement"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Statement
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-500">No members match your filters.</p>
            </div>
          )}
        </div>
      </div>

      <MemberFormModal open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
