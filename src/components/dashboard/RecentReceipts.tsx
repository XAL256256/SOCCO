"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface ReceiptRow {
  id: string;
  receiptNumber: string;
  memberName: string;
  totalAmount: number;
  issuedAt: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function RecentReceipts({ receipts }: { receipts: ReceiptRow[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="mt-3 bg-surface border border-line rounded-[4px] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <p className="font-mono text-[10px] text-dim tracking-[0.12em] uppercase mb-0.5">
            Recent Receipts
          </p>
          <p className="font-dm text-sub text-xs">Latest financial movements</p>
        </div>
        <Link
          href="/receipts"
          className="flex items-center gap-1 font-mono text-[10px] text-gold tracking-widest uppercase hover:text-txt transition-colors duration-150 group"
        >
          View all
          <ArrowUpRight
            size={11}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150"
          />
        </Link>
      </div>

      {receipts.length === 0 ? (
        <div className="px-5 py-12 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-dim" />
          </div>
          <p className="font-mono text-[10px] text-dim tracking-widest uppercase">
            No receipts yet — log a contribution to issue your first
          </p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className="grid grid-cols-12 gap-4 px-5 py-2.5 border-b border-line">
            <span className="col-span-4 font-mono text-[9px] text-dim tracking-[0.1em] uppercase">Member</span>
            <span className="col-span-3 font-mono text-[9px] text-dim tracking-[0.1em] uppercase">Receipt #</span>
            <span className="col-span-3 font-mono text-[9px] text-dim tracking-[0.1em] uppercase">Amount</span>
            <span className="col-span-2 font-mono text-[9px] text-dim tracking-[0.1em] uppercase">Date</span>
          </div>

          {receipts.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-line last:border-0 hover:bg-raised transition-colors duration-150"
            >
              {/* Member */}
              <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-[2px] bg-gold-dim border border-gold-bd flex items-center justify-center flex-shrink-0">
                  <span className="font-syne font-bold text-gold text-[10px]">
                    {initials(r.memberName)}
                  </span>
                </div>
                <span className="font-dm text-sm text-txt truncate">{r.memberName}</span>
              </div>
              {/* Receipt # */}
              <div className="col-span-3 flex items-center">
                <span className="font-mono text-[10px] text-sub tracking-wide">{r.receiptNumber}</span>
              </div>
              {/* Amount */}
              <div className="col-span-3 flex items-center">
                <span className="font-mono text-sm text-gold">
                  {r.totalAmount.toLocaleString()}
                </span>
              </div>
              {/* Date */}
              <div className="col-span-2 flex items-center">
                <span className="font-mono text-[10px] text-dim">
                  {format(new Date(r.issuedAt), "dd MMM")}
                </span>
              </div>
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
}
