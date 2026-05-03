"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, FileText } from "lucide-react";
import Link from "next/link";
import { MemberFormModal } from "./MemberFormModal";
import { cn } from "@/lib/utils";

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

const STATUS_TABS = ["ALL", "ACTIVE", "INACTIVE", "SUSPENDED", "EXITED"] as const;

const STATUS_MAP: Record<Member["status"], { dot: string; text: string; label: string }> = {
  ACTIVE:    { dot: "#2DC98A", text: "text-growth",  label: "Active" },
  INACTIVE:  { dot: "#4A5268", text: "text-dim",     label: "Inactive" },
  SUSPENDED: { dot: "#E8A838", text: "text-gold",    label: "Suspended" },
  EXITED:    { dot: "#E05454", text: "text-danger",  label: "Exited" },
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  return (
    <div className="w-9 h-9 rounded-[2px] bg-gold-dim border border-gold-bd flex items-center justify-center flex-shrink-0">
      <span className="font-syne font-bold text-gold text-xs">
        {parts
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </span>
    </div>
  );
}

export function MembersTable({ initial }: { initial: Member[] }) {
  const [items, setItems] = useState<Member[]>(initial);
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("ALL");
  const [adding, setAdding] = useState(false);

  useEffect(() => setItems(initial), [initial]);

  const filtered = useMemo(() => {
    return items.filter((m) => {
      if (activeTab !== "ALL" && m.status !== activeTab) return false;
      if (!q) return true;
      const hay =
        `${m.firstName} ${m.lastName} ${m.phoneNumber} ${m.memberNumber} ${m.email ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [items, q, activeTab]);

  return (
    <>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 flex-wrap gap-4"
      >
        <div>
          <h1 className="font-syne text-2xl font-bold text-txt">Members</h1>
          <p className="font-mono text-[10px] text-dim tracking-widest uppercase mt-1">
            {items.length} registered &middot;{" "}
            {items.filter((i) => i.status === "ACTIVE").length} active
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={14} />
          Add Member
        </button>
      </motion.div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-surface border border-line rounded-[4px] overflow-hidden"
      >
        {/* Filter bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line flex-wrap gap-y-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search members…"
              className="w-full bg-raised border border-line rounded-[2px] pl-8 pr-3 py-2 font-dm text-sm text-txt placeholder:text-dim outline-none focus:border-gold-bd transition-colors duration-150"
            />
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1 ml-auto flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 transition-colors duration-150",
                  activeTab === tab ? "text-gold" : "text-dim hover:text-sub"
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="member-tab"
                    className="absolute inset-0 bg-gold-dim border border-gold-bd rounded-[2px]"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-line">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <p className="font-mono text-[10px] text-dim tracking-widest uppercase">
                  No members match your filters
                </p>
              </motion.div>
            ) : (
              filtered.map((m, i) => {
                const s = STATUS_MAP[m.status];
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-4 hover:bg-raised transition-colors"
                  >
                    <Link href={`/members/${m.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <Initials name={`${m.firstName} ${m.lastName}`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-dm font-medium text-sm text-txt truncate">
                          {m.firstName} {m.lastName}
                        </p>
                        <p className="font-mono text-[10px] text-dim">
                          {m.memberNumber} · {m.phoneNumber}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                      <span className={`font-mono text-[9px] tracking-widest uppercase ${s.text}`}>
                        {s.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Desktop table */}
        <table className="hidden w-full sm:table">
          <thead>
            <tr className="border-b border-line">
              {["Member", "Contact", "Activity", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left font-mono text-[9px] text-dim tracking-[0.1em] uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.tr
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <p className="font-mono text-[10px] text-dim tracking-widest uppercase">
                      No members match your filters
                    </p>
                  </td>
                </motion.tr>
              ) : (
                filtered.map((m, i) => {
                  const s = STATUS_MAP[m.status];
                  return (
                    <motion.tr
                      key={m.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-line last:border-0 hover:bg-raised transition-colors duration-150 group cursor-pointer"
                    >
                      {/* Member */}
                      <td className="px-5 py-3.5">
                        <Link href={`/members/${m.id}`} className="flex items-center gap-3">
                          <Initials name={`${m.firstName} ${m.lastName}`} />
                          <div>
                            <p className="font-dm text-sm font-medium text-txt">
                              {m.firstName} {m.lastName}
                            </p>
                            <p className="font-mono text-[9px] text-dim">{m.memberNumber}</p>
                          </div>
                        </Link>
                      </td>
                      {/* Contact */}
                      <td className="px-5 py-3.5">
                        <p className="font-dm text-xs text-sub">{m.phoneNumber}</p>
                        {m.email && (
                          <p className="font-dm text-xs text-dim">{m.email}</p>
                        )}
                      </td>
                      {/* Activity */}
                      <td className="px-5 py-3.5">
                        <p className="font-mono text-xs text-sub">
                          <span className="text-txt">{m._count.contributions}</span> contributions
                        </p>
                        <p className="font-mono text-xs text-dim">
                          {m._count.attendance} meetings attended
                        </p>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                          <span className={`font-mono text-[9px] tracking-widest uppercase ${s.text}`}>
                            {s.label}
                          </span>
                        </div>
                      </td>
                      {/* Action */}
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/members/${m.id}/statement`}
                          className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 font-mono text-[9px] text-dim hover:text-gold tracking-widest uppercase transition-all duration-150"
                        >
                          <FileText size={11} />
                          Statement
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      <MemberFormModal open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
