"use client";

import { Download, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { downloadCsv } from "@/lib/csv";
import { formatNumber } from "@/lib/utils";

type Row = {
  no: number;
  memberId: string;
  memberName: string;
  memberNumber: string;
  repayments: number;
  savings: number;
  welfare: number;
  charges: number;
  fees: number;
  total: number;
};

export function CollectionsTable({
  rows,
  totals,
  exportFilename = "NBOOG-Collections.csv",
}: {
  rows: Row[];
  totals: {
    repayments: number;
    savings: number;
    welfare: number;
    charges: number;
    fees: number;
    grand: number;
  };
  exportFilename?: string;
}) {
  const [q, setQ] = useState("");

  const exportCsv = () => {
    const header = ["#", "Member", "Member No", "Repayments", "Savings", "Welfare", "Charges", "Fees", "TOTAL"];
    const dataRows = rows.map((r) => [
      r.no, r.memberName, r.memberNumber,
      r.repayments, r.savings, r.welfare, r.charges, r.fees, r.total,
    ]);
    const totalsRow = ["", "TOTAL", "", totals.repayments, totals.savings, totals.welfare, totals.charges, totals.fees, totals.grand];
    downloadCsv(exportFilename, [header, ...dataRows, totalsRow]);
  };
  const filtered = useMemo(
    () =>
      q
        ? rows.filter((r) =>
            (r.memberName + " " + r.memberNumber)
              .toLowerCase()
              .includes(q.toLowerCase())
          )
        : rows,
    [rows, q]
  );

  const fmt = (v: number) => (v === 0 ? "—" : formatNumber(v));

  return (
    <>
      <div className="no-print mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            leadingIcon={<Search className="h-4 w-4" />}
            placeholder="Filter by member name or number…"
          />
        </div>
        <button onClick={exportCsv} className="btn-outline !py-2.5 shrink-0">
          <Download className="h-4 w-4" />
          CSV
        </button>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-50 px-3 py-2 sm:grid-cols-5">
          <Stat label="Repayments" value={totals.repayments} />
          <Stat label="Savings" value={totals.savings} />
          <Stat label="Welfare" value={totals.welfare} />
          <Stat label="Charges" value={totals.charges} />
          <Stat label="Fees" value={totals.fees} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr className="bg-primary-50 text-left">
              <th className="px-3 py-2 font-display text-xs uppercase tracking-wider w-10 text-primary-800">
                #
              </th>
              <th className="px-3 py-2 font-display text-xs uppercase tracking-wider text-primary-800 sticky left-0 bg-primary-50">
                Member
              </th>
              <th className="px-3 py-2 text-right font-display text-xs uppercase tracking-wider text-primary-800">
                Repayments
              </th>
              <th className="px-3 py-2 text-right font-display text-xs uppercase tracking-wider text-primary-800">
                Savings
              </th>
              <th className="px-3 py-2 text-right font-display text-xs uppercase tracking-wider text-primary-800">
                Welfare
              </th>
              <th className="px-3 py-2 text-right font-display text-xs uppercase tracking-wider text-primary-800">
                Charges
              </th>
              <th className="px-3 py-2 text-right font-display text-xs uppercase tracking-wider text-primary-800">
                Fees
              </th>
              <th className="px-3 py-2 text-right font-display text-xs uppercase tracking-wider text-primary-900 bg-primary-100">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <motion.tr
                key={r.memberId}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.005 }}
                className="border-b border-gray-100 hover:bg-primary-50/40"
              >
                <td className="px-3 py-2 font-mono text-xs text-gray-500">
                  {r.no}
                </td>
                <td className="px-3 py-2 sticky left-0 bg-white">
                  <Link
                    href={`/members/${r.memberId}`}
                    className="block hover:text-primary-700"
                  >
                    <p className="font-medium">{r.memberName}</p>
                    <p className="font-mono text-[10px] text-gray-400">
                      {r.memberNumber}
                    </p>
                  </Link>
                </td>
                <td className={`px-3 py-2 text-right font-mono ${r.repayments ? "text-gray-900" : "text-gray-300"}`}>
                  {fmt(r.repayments)}
                </td>
                <td className={`px-3 py-2 text-right font-mono ${r.savings ? "text-gray-900" : "text-gray-300"}`}>
                  {fmt(r.savings)}
                </td>
                <td className={`px-3 py-2 text-right font-mono ${r.welfare ? "text-gray-900" : "text-gray-300"}`}>
                  {fmt(r.welfare)}
                </td>
                <td className={`px-3 py-2 text-right font-mono ${r.charges ? "text-gray-900" : "text-gray-300"}`}>
                  {fmt(r.charges)}
                </td>
                <td className={`px-3 py-2 text-right font-mono ${r.fees ? "text-gray-900" : "text-gray-300"}`}>
                  {fmt(r.fees)}
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-primary-900 bg-primary-50/60">
                  {fmt(r.total)}
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-gray-500">
                  No collections this month.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-900 text-white">
              <td colSpan={2} className="px-3 py-3 font-display font-bold uppercase tracking-wider">
                TOTAL
              </td>
              <td className="px-3 py-3 text-right font-mono font-bold">{fmt(totals.repayments)}</td>
              <td className="px-3 py-3 text-right font-mono font-bold">{fmt(totals.savings)}</td>
              <td className="px-3 py-3 text-right font-mono font-bold">{fmt(totals.welfare)}</td>
              <td className="px-3 py-3 text-right font-mono font-bold">{fmt(totals.charges)}</td>
              <td className="px-3 py-3 text-right font-mono font-bold">{fmt(totals.fees)}</td>
              <td className="px-3 py-3 text-right font-mono font-bold bg-primary-700">
                {fmt(totals.grand)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">
        {label}
      </p>
      <p className="font-mono text-sm font-bold">{formatNumber(value)}</p>
    </div>
  );
}
