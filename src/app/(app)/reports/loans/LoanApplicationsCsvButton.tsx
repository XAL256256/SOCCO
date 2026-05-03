"use client";

import { Download } from "lucide-react";
import { downloadCsv } from "@/lib/csv";

type Group = {
  monthLabel: string;
  rows: { no: number; borrower: string; memberNumber: string; requestedAmount: number; approvedAmount: number; termMonths: number; status: string }[];
  totals: { requested: number; approved: number };
};

export function LoanApplicationsCsvButton({
  groups,
  year,
}: {
  groups: Group[];
  year: number;
}) {
  const handleExport = () => {
    const header = ["Month", "#", "Borrower", "Member No", "Requested (UGX)", "Approved (UGX)", "Term (months)", "Status"];
    const rows: (string | number)[][] = [header];
    for (const g of groups) {
      for (const r of g.rows) {
        rows.push([g.monthLabel, r.no, r.borrower, r.memberNumber, r.requestedAmount, r.approvedAmount, r.termMonths, r.status]);
      }
      rows.push([g.monthLabel + " TOTAL", "", "", "", g.totals.requested, g.totals.approved, "", ""]);
    }
    downloadCsv(`NBOOG-Loan-Applications-${year}.csv`, rows);
  };

  return (
    <button onClick={handleExport} className="btn-outline !py-2.5">
      <Download className="h-4 w-4" />
      CSV
    </button>
  );
}
