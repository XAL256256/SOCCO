"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { formatNumber } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv";

type Row = {
  no: number;
  memberId: string;
  memberName: string;
  memberNumber: string;
  cells: number[];
  total: number;
};

type Props = {
  monthLabels: string[];
  rows: Row[];
  columnTotals: number[];
  grandTotal: number;
  unitLabel?: string;
  highlightCurrentMonth?: boolean;
  exportFilename?: string;
};

export function MatrixTable({
  monthLabels,
  rows,
  columnTotals,
  grandTotal,
  highlightCurrentMonth = true,
  exportFilename = "report.csv",
}: Props) {
  const [q, setQ] = useState("");

  const exportCsv = () => {
    const header = ["#", "Member", "Member No", ...monthLabels, "TOTAL"];
    const dataRows = rows.map((r) => [
      r.no,
      r.memberName,
      r.memberNumber,
      ...r.cells,
      r.total,
    ]);
    const totalsRow = ["", "TOTAL", "", ...columnTotals, grandTotal];
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

  const currentMonthIdx = highlightCurrentMonth
    ? monthLabels.findIndex((l) => {
        const d = new Date();
        return l.includes(d.toLocaleString("en", { month: "short" }));
      })
    : -1;

  const fmt = (v: number) => (v === 0 ? "—" : formatNumber(v));

  return (
    <>
      <div className="no-print mb-4 flex items-center gap-3">
        <div className="flex-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            leadingIcon={<Search className="h-4 w-4" />}
            placeholder="Filter by member name or number…"
          />
        </div>
        <button
          onClick={exportCsv}
          className="btn-outline !py-2.5 shrink-0"
          title="Download CSV"
        >
          <Download className="h-4 w-4" />
          CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr className="bg-primary-50 text-left">
              <th className="px-2 py-2 sm:px-3 font-display text-xs uppercase tracking-wider text-primary-800 w-10">
                #
              </th>
              <th className="px-2 py-2 sm:px-3 font-display text-xs uppercase tracking-wider text-primary-800 sticky left-0 bg-primary-50 z-10">
                Member
              </th>
              {monthLabels.map((l, i) => (
                <th
                  key={l}
                  className={`px-2 py-2 sm:px-3 font-mono text-xs text-right text-primary-800 whitespace-nowrap ${
                    i === currentMonthIdx ? "bg-primary-100" : ""
                  }`}
                >
                  {l}
                </th>
              ))}
              <th className="px-3 py-2 font-mono text-xs text-right text-primary-900 bg-primary-100">
                TOTAL
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
                <td className="px-2 py-2 sm:px-3 font-mono text-gray-500 text-xs">
                  {r.no}
                </td>
                <td className="px-2 py-2 sm:px-3 font-medium text-gray-900 sticky left-0 bg-white whitespace-nowrap z-10">
                  <div>{r.memberName}</div>
                  <div className="font-mono text-[10px] text-gray-400">
                    {r.memberNumber}
                  </div>
                </td>
                {r.cells.map((v, i) => (
                  <td
                    key={i}
                    className={`px-2 py-2 sm:px-3 font-mono text-right whitespace-nowrap ${
                      v === 0 ? "text-gray-300" : "text-gray-900"
                    } ${i === currentMonthIdx ? "bg-primary-50/60" : ""}`}
                  >
                    {fmt(v)}
                  </td>
                ))}
                <td className="px-3 py-2 font-mono text-right font-bold text-primary-900 bg-primary-50/60">
                  {fmt(r.total)}
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-900 text-white">
              <td colSpan={2} className="px-2 sm:px-3 py-3 font-display font-bold uppercase tracking-wider">
                TOTAL
              </td>
              {columnTotals.map((c, i) => (
                <td key={i} className="px-2 sm:px-3 py-3 font-mono text-right font-bold whitespace-nowrap">
                  {fmt(c)}
                </td>
              ))}
              <td className="px-3 py-3 font-mono text-right font-bold bg-primary-700">
                {fmt(grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
