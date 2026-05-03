"use client";

import { motion } from "framer-motion";
import { Download, FileText, Printer } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { downloadCsv } from "@/lib/csv";
import { formatUGX } from "@/lib/utils";

type Receipt = {
  id: string;
  receiptNumber: string;
  totalAmount: number;
  integrityHash: string;
  version: number;
  issuedAt: string;
};

type Contribution = {
  id: string;
  createdAt: string;
  welfareAmount: number;
  savingsAmount: number;
  loanRepayment: number;
  fineAmount: number;
  shareAmount: number;
  registrationFee: number;
  otherAmount: number;
  totalAmount: number;
  paymentMethod: string;
  meeting: { title: string; meetingDate: string } | null;
  receipt: Receipt | null;
};

type Attendance = {
  id: string;
  status: string;
  checkedInAt: string;
  meeting: { title: string; meetingDate: string };
};

type Fine = {
  id: string;
  reason: string;
  amount: number;
  description: string | null;
  status: string;
  createdAt: string;
};

type Loan = {
  id: string;
  loanNumber: string;
  principalAmount: number;
  requestedAmount: number;
  interestRate: number;
  termMonths: number;
  amountRepaid: number;
  status: string;
  purpose: string | null;
  appliedAt: string;
  disbursedAt: string | null;
  dueAt: string | null;
  schedule: { id: string; dueDate: string; amount: number; paidAmount: number; status: string }[];
};

type Props = {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    memberNumber: string;
    phoneNumber: string;
    email: string | null;
    joinedAt: string;
    status: string;
  };
  year: number;
  years: number[];
  contributions: Contribution[];
  attendance: Attendance[];
  fines: Fine[];
  loans: Loan[];
};

function n(v: number): string {
  if (v === 0) return "-";
  return v.toLocaleString("en-UG");
}

export function StatementClient({
  member,
  year,
  years,
  contributions,
  attendance,
  fines,
  loans,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setYear = (y: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("year", String(y));
    router.push(`${pathname}?${sp.toString()}`);
  };

  let savingsRunning = 0;
  let welfareRunning = 0;
  const ledger = contributions.map((c, idx) => {
    savingsRunning += c.savingsAmount;
    welfareRunning += c.welfareAmount;
    return { ...c, savingsRunning, welfareRunning, rowNum: idx + 1 };
  });

  const totals = {
    contributed: contributions.reduce((a, c) => a + c.totalAmount, 0),
    savings: savingsRunning,
    welfare: welfareRunning,
    loanRepaid: contributions.reduce((a, c) => a + c.loanRepayment, 0),
    charges: contributions.reduce((a, c) => a + c.fineAmount + c.shareAmount, 0),
    fees: contributions.reduce((a, c) => a + c.registrationFee + c.otherAmount, 0),
    finesOutstanding: fines.reduce((a, f) => a + (f.status === "OUTSTANDING" ? f.amount : 0), 0),
  };

  const activeLoans = loans.filter((l) =>
    ["DISBURSED", "ACTIVE", "APPROVED"].includes(l.status)
  );
  const loanOutstanding = activeLoans.reduce(
    (a, l) => a + Math.max(0, l.principalAmount - l.amountRepaid),
    0
  );

  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const lateCount = attendance.filter((a) => a.status === "LATE").length;
  const absentCount = attendance.filter((a) => a.status === "ABSENT").length;

  const memberFullName = `${member.lastName} ${member.firstName}`;

  const exportStatementCsv = () => {
    const generated = format(new Date(), "d-MMM-yy  h:mm a");
    const blankRow = ["", "", "", "", "", "", "", "", "", "", ""];

    // Document header block — mirrors the NBOOG Excel report style
    const meta: (string | number)[][] = [
      ["NBOOG SACCO", "", "", "", "", "", "", "", "", "", ""],
      ["Mukono District, Uganda", "", "", "", "", "", "", "", "", "", ""],
      [blankRow.join("")],
      [`MEMBER STATEMENT — ${year}`, "", "", "", "", "", "", "", "", "", ""],
      [`Member: ${memberFullName}`, "", `ID: ${member.memberNumber}`, "", `Status: ${member.status}`, "", `Phone: ${member.phoneNumber}`, "", "", "", ""],
      [`Joined: ${format(new Date(member.joinedAt), "d-MMM-yyyy")}`, "", "", "", "", `Generated: ${generated}`, "", "", "", "", ""],
      blankRow,
      // KPI summary row
      [`Total Contributed (${year})`, n(totals.contributed), "", `Savings Balance`, n(totals.savings), "", `Welfare Paid`, n(totals.welfare), "", `Loan Outstanding`, n(loanOutstanding)],
      blankRow,
      ["CONTRIBUTION LEDGER", "", "", "", "", "", "", "", "", "", ""],
      blankRow,
    ];

    const header = ["#", "Date", "Meeting", "Receipt No", "Repayments", "Savings", "Welfare", "Charges", "Fees", "Total", "Running Savings"];

    const rows = ledger.map((c) => [
      c.rowNum,
      format(new Date(c.createdAt), "d-MMM-yy"),
      c.meeting?.title ?? "Direct deposit",
      c.receipt?.receiptNumber ?? "",
      c.loanRepayment || "-",
      c.savingsAmount || "-",
      c.welfareAmount || "-",
      c.fineAmount + c.shareAmount || "-",
      c.registrationFee + c.otherAmount || "-",
      c.totalAmount,
      c.savingsRunning,
    ]);

    const totalsRow = [
      "TOTAL", "", "", "",
      totals.loanRepaid || "-",
      totals.savings || "-",
      totals.welfare || "-",
      totals.charges || "-",
      totals.fees || "-",
      totals.contributed,
      "",
    ];

    // Receipts section
    const receiptsHeader = ["", "", "", "", "", "", "", "", "", "", ""];
    const receiptsTitle = ["RECEIPTS", "", "", "", "", "", "", "", "", "", ""];
    const receiptsColHead = ["#", "Receipt Number", "Date Issued", "Amount", "Version", "Integrity (first 16)", "", "", "", "", ""];
    const receiptRows = ledger
      .filter((c) => c.receipt)
      .map((c, idx) => [
        idx + 1,
        c.receipt!.receiptNumber,
        format(new Date(c.receipt!.issuedAt), "d-MMM-yyyy"),
        c.receipt!.totalAmount,
        `v${c.receipt!.version}`,
        c.receipt!.integrityHash.slice(0, 16),
        "", "", "", "", "",
      ]);

    downloadCsv(
      `NBOOG-Statement-${member.memberNumber}-${year}.csv`,
      [
        ...meta,
        header,
        ...rows,
        totalsRow,
        receiptsHeader,
        receiptsTitle,
        receiptsColHead,
        ...receiptRows,
      ]
    );
  };

  const exportReceiptsCsv = () => {
    const generated = format(new Date(), "d-MMM-yy  h:mm a");
    const meta: (string | number)[][] = [
      ["NBOOG SACCO"],
      ["Mukono District, Uganda"],
      [""],
      [`RECEIPTS REGISTER — ${year}`],
      [`Member: ${memberFullName}   ID: ${member.memberNumber}`],
      [`Generated: ${generated}`],
      [""],
    ];
    const header = ["#", "Receipt Number", "Date Issued", "Amount (UGX)", "Version", "Integrity Hash (first 16)"];
    const rows = contributions
      .filter((c) => c.receipt)
      .map((c, idx) => [
        idx + 1,
        c.receipt!.receiptNumber,
        format(new Date(c.receipt!.issuedAt), "d-MMM-yyyy"),
        c.receipt!.totalAmount,
        `v${c.receipt!.version}`,
        c.receipt!.integrityHash.slice(0, 16),
      ]);
    downloadCsv(
      `NBOOG-Receipts-${member.memberNumber}-${year}.csv`,
      [...meta, header, ...rows]
    );
  };

  return (
    <>
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary-600">
            Member statement
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
            {member.firstName} {member.lastName}
          </h1>
          <p className="mt-1 font-mono text-sm text-gray-500">
            {member.memberNumber} · {member.phoneNumber}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year picker */}
          <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  y === year
                    ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-glow"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
          <button onClick={exportStatementCsv} className="btn-outline !py-2.5">
            <Download className="h-4 w-4" />
            Statement CSV
          </button>
          <button onClick={exportReceiptsCsv} className="btn-outline !py-2.5">
            <FileText className="h-4 w-4" />
            Receipts CSV
          </button>
          <button onClick={() => window.print()} className="btn-primary !py-2.5">
            <Printer className="h-4 w-4" />
            Print / PDF
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[28px] bg-white shadow-elevated"
      >
        <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-7 py-6 text-white print:from-gray-900 print:via-gray-800 print:to-gray-900">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-accent-400 to-secondary-500" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-white">
                NBOOG SACCO
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400">
                Mukono District, Uganda
              </p>
              <p className="mt-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-300">
                Member Statement · {year}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="font-display text-lg font-bold tracking-tight">
                {member.lastName}, {member.firstName}
              </p>
              <p className="font-mono text-sm text-gray-400">{member.memberNumber}</p>
              <p className="font-mono text-xs text-gray-500">{member.phoneNumber}</p>
              <p className="mt-1.5 font-mono text-[10px] text-gray-500">
                Joined {format(new Date(member.joinedAt), "d MMM yyyy")} ·{" "}
                <span className={member.status === "ACTIVE" ? "text-secondary-300" : "text-red-400"}>
                  {member.status}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 sm:grid-cols-4">
            <HeaderKpi label="Total contributed" value={formatUGX(totals.contributed)} />
            <HeaderKpi label="Savings balance" value={formatUGX(totals.savings)} accent="secondary" />
            <HeaderKpi label="Welfare paid" value={formatUGX(totals.welfare)} accent="accent" />
            <HeaderKpi label="Loan outstanding" value={loanOutstanding > 0 ? formatUGX(loanOutstanding) : "None"} />
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <DocSection title={`CONTRIBUTION LEDGER · ${year}`}>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-900 bg-gray-900 text-white">
                    <Th align="center" className="w-8">#</Th>
                    <Th>Date</Th>
                    <Th>Meeting</Th>
                    <Th>Receipt</Th>
                    <Th align="right">Repayments</Th>
                    <Th align="right">Savings</Th>
                    <Th align="right">Welfare</Th>
                    <Th align="right">Charges</Th>
                    <Th align="right">Fees</Th>
                    <Th align="right" className="border-l border-white/20">Total</Th>
                    <Th align="right" className="bg-primary-800">Savings Balance</Th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-sm text-gray-400">
                        No contributions recorded for {year}.
                      </td>
                    </tr>
                  ) : (
                    ledger.map((c, idx) => (
                      <tr
                        key={c.id}
                        className={`border-b border-gray-100 transition-colors hover:bg-primary-50/40 ${
                          idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-400">
                          {c.rowNum}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs whitespace-nowrap text-gray-600">
                          {format(new Date(c.createdAt), "d-MMM-yy")}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-700 max-w-[140px] truncate">
                          {c.meeting?.title ?? "Direct deposit"}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs">
                          {c.receipt ? (
                            <span title={`v${c.receipt.version} · ${c.receipt.integrityHash.slice(0, 8)}…`} className="whitespace-nowrap">
                              {c.receipt.receiptNumber}
                              {c.receipt.version > 1 && (
                                <span className="ml-1 rounded bg-accent-100 px-1 text-[9px] font-bold text-accent-800">
                                  v{c.receipt.version}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <NCell v={c.loanRepayment} />
                        <NCell v={c.savingsAmount} highlight />
                        <NCell v={c.welfareAmount} />
                        <NCell v={c.fineAmount + c.shareAmount} />
                        <NCell v={c.registrationFee + c.otherAmount} />
                        <td className="border-l border-gray-100 px-3 py-2.5 text-right font-mono font-semibold text-gray-900">
                          {n(c.totalAmount)}
                        </td>
                        <td className="bg-primary-50/60 px-3 py-2.5 text-right font-mono font-bold text-secondary-700">
                          {n(c.savingsRunning)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {ledger.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-gray-900 bg-gray-900 text-white">
                      <td colSpan={4} className="px-4 py-3 font-display text-sm font-bold uppercase tracking-widest">
                        TOTAL
                      </td>
                      <NTotalCell v={totals.loanRepaid} />
                      <NTotalCell v={totals.savings} />
                      <NTotalCell v={totals.welfare} />
                      <NTotalCell v={totals.charges} />
                      <NTotalCell v={totals.fees} />
                      <td className="border-l border-white/20 px-3 py-3 text-right font-mono font-bold">
                        {n(totals.contributed)}
                      </td>
                      <td className="bg-primary-800 px-3 py-3 text-right font-mono font-bold">
                        {n(totals.savings)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </DocSection>

          {ledger.filter((c) => c.receipt).length > 0 && (
            <DocSection title={`RECEIPTS REGISTER · ${year}`}>
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-900 bg-gray-900 text-white">
                      <Th className="w-8" align="center">#</Th>
                      <Th>Receipt Number</Th>
                      <Th>Date Issued</Th>
                      <Th align="right">Amount (UGX)</Th>
                      <Th align="center">Version</Th>
                      <Th align="right">Integrity</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger
                      .filter((c) => c.receipt)
                      .map((c, idx) => (
                        <tr
                          key={c.id}
                          className={`border-b border-gray-100 hover:bg-primary-50/30 ${
                            idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                          }`}
                        >
                          <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-400">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs font-semibold">
                            {c.receipt!.receiptNumber}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs">
                            {format(new Date(c.receipt!.issuedAt), "d-MMM-yyyy")}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold">
                            {n(c.receipt!.totalAmount)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className={
                                c.receipt!.version > 1 ? "chip-accent" : "chip-gray"
                              }
                            >
                              v{c.receipt!.version}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-[10px] text-gray-400">
                            {c.receipt!.integrityHash.slice(0, 12)}…
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </DocSection>
          )}

          <DocSection title={`ATTENDANCE · ${year}`}>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <AttTile label="Present" value={presentCount} color="secondary" />
              <AttTile label="Late" value={lateCount} color="accent" />
              <AttTile label="Absent" value={absentCount} color="danger" />
            </div>
            {attendance.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-900 bg-gray-900 text-white">
                      <Th className="w-8" align="center">#</Th>
                      <Th>Meeting Date</Th>
                      <Th>Meeting</Th>
                      <Th>Check-in</Th>
                      <Th align="right">Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((a, idx) => (
                      <tr
                        key={a.id}
                        className={`border-b border-gray-100 ${idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"}`}
                      >
                        <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-400">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs whitespace-nowrap">
                          {format(new Date(a.meeting.meetingDate), "d-MMM-yy")}
                        </td>
                        <td className="px-3 py-2.5 text-xs">{a.meeting.title}</td>
                        <td className="px-3 py-2.5 font-mono text-xs">
                          {format(new Date(a.checkedInAt), "h:mm a")}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span
                            className={
                              a.status === "PRESENT"
                                ? "chip-secondary"
                                : a.status === "LATE"
                                ? "chip-accent"
                                : a.status === "EXCUSED"
                                ? "chip-gray"
                                : "chip-danger"
                            }
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DocSection>

          {fines.length > 0 && (
            <DocSection title={`FINES · ${year}`}>
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-900 bg-gray-900 text-white">
                      <Th className="w-8" align="center">#</Th>
                      <Th>Date</Th>
                      <Th>Reason</Th>
                      <Th>Description</Th>
                      <Th align="right">Amount</Th>
                      <Th align="right">Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map((f, idx) => (
                      <tr
                        key={f.id}
                        className={`border-b border-gray-100 ${idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"}`}
                      >
                        <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-400">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs whitespace-nowrap">
                          {format(new Date(f.createdAt), "d-MMM-yy")}
                        </td>
                        <td className="px-3 py-2.5 text-xs">{f.reason.replace(/_/g, " ")}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-600">
                          {f.description ?? "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono">{n(f.amount)}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span
                            className={
                              f.status === "PAID"
                                ? "chip-secondary"
                                : f.status === "WAIVED"
                                ? "chip-gray"
                                : "chip-danger"
                            }
                          >
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DocSection>
          )}

          {loans.length > 0 && (
            <DocSection title="LOANS (ALL TIME)">
              <div className="space-y-3">
                {loans.map((l) => (
                  <div key={l.id} className="overflow-hidden rounded-2xl border border-gray-200">
                    <div
                      className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 ${
                        ["DISBURSED", "ACTIVE"].includes(l.status)
                          ? "bg-secondary-50"
                          : l.status === "PENDING"
                          ? "bg-accent-50"
                          : ["REJECTED", "DEFAULTED"].includes(l.status)
                          ? "bg-red-50"
                          : "bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className="font-mono text-xs font-semibold text-gray-600">
                          {l.loanNumber}
                        </p>
                        <p className="font-display text-base font-bold">
                          {formatUGX(l.principalAmount)} ·{" "}
                          {l.termMonths} months ·{" "}
                          {(l.interestRate * 100).toFixed(0)}% flat
                        </p>
                        {l.purpose && (
                          <p className="text-xs italic text-gray-600">&ldquo;{l.purpose}&rdquo;</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>Applied {format(new Date(l.appliedAt), "d MMM yyyy")}</span>
                        <span
                          className={
                            ["DISBURSED", "ACTIVE"].includes(l.status)
                              ? "chip-secondary"
                              : l.status === "PENDING"
                              ? "chip-accent"
                              : ["REJECTED", "DEFAULTED"].includes(l.status)
                              ? "chip-danger"
                              : "chip-gray"
                          }
                        >
                          {l.status}
                        </span>
                      </div>
                    </div>

                    {l.schedule.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-100 text-gray-500">
                              <th className="px-4 py-2 text-left font-mono uppercase tracking-wider">
                                Due Date
                              </th>
                              <th className="px-4 py-2 text-right font-mono uppercase tracking-wider">
                                Instalment
                              </th>
                              <th className="px-4 py-2 text-right font-mono uppercase tracking-wider">
                                Paid
                              </th>
                              <th className="px-4 py-2 text-right font-mono uppercase tracking-wider">
                                Balance
                              </th>
                              <th className="px-4 py-2 text-right font-mono uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {l.schedule.map((s, idx) => (
                              <tr
                                key={s.id}
                                className={`border-t border-gray-100 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                              >
                                <td className="px-4 py-1.5 font-mono">
                                  {format(new Date(s.dueDate), "d MMM yyyy")}
                                </td>
                                <td className="px-4 py-1.5 text-right font-mono">
                                  {n(s.amount)}
                                </td>
                                <td className="px-4 py-1.5 text-right font-mono text-secondary-700">
                                  {s.paidAmount > 0 ? n(s.paidAmount) : "—"}
                                </td>
                                <td className="px-4 py-1.5 text-right font-mono text-gray-500">
                                  {n(Math.max(0, s.amount - s.paidAmount))}
                                </td>
                                <td className="px-4 py-1.5 text-right">
                                  <span
                                    className={
                                      s.status === "PAID"
                                        ? "chip-secondary"
                                        : s.status === "OVERDUE"
                                        ? "chip-danger"
                                        : s.status === "PARTIAL"
                                        ? "chip-accent"
                                        : "chip-gray"
                                    }
                                  >
                                    {s.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-100 font-semibold">
                              <td className="px-4 py-2 font-mono text-xs uppercase">Total</td>
                              <td className="px-4 py-2 text-right font-mono">
                                {n(l.schedule.reduce((a, s) => a + s.amount, 0))}
                              </td>
                              <td className="px-4 py-2 text-right font-mono text-secondary-700">
                                {n(l.amountRepaid)}
                              </td>
                              <td className="px-4 py-2 text-right font-mono text-gray-600">
                                {n(Math.max(0, l.principalAmount - l.amountRepaid))}
                              </td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DocSection>
          )}

          <div className="mt-10 border-t border-gray-100 pt-5 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
              NBOOG SACCO · {member.memberNumber} ·{" "}
              {member.lastName} {member.firstName} · Statement {year}
            </p>
            <p className="mt-1 font-mono text-[10px] text-gray-300">
              Generated {format(new Date(), "PPp")} · This document is system-generated and
              verifiable via receipt integrity hashes.
            </p>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          .no-print { display: none !important; }
          aside, header, nav { display: none !important; }
          main { padding: 0 !important; }
          body { background: white !important; }
          thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
}

function DocSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <h2 className="font-display text-xs font-bold uppercase tracking-widest text-gray-500">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      {children}
    </div>
  );
}

function HeaderKpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "secondary" | "accent";
}) {
  const valueClass =
    accent === "secondary"
      ? "text-secondary-300"
      : accent === "accent"
      ? "text-accent-300"
      : "text-white";
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">{label}</p>
      <p className={`mt-0.5 font-mono text-sm font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function AttTile({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "secondary" | "accent" | "danger";
}) {
  const map = {
    secondary: "bg-secondary-50 border-secondary-200 text-secondary-700",
    accent: "bg-accent-50 border-accent-200 text-accent-800",
    danger: "bg-red-50 border-red-200 text-red-700",
  };
  return (
    <div className={`rounded-2xl border-2 p-3 text-center ${map[color]}`}>
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest opacity-70">{label}</p>
    </div>
  );
}

function Th({
  children,
  align,
  className = "",
}: {
  children: React.ReactNode;
  align?: "right" | "center";
  className?: string;
}) {
  const al =
    align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : "text-left";
  return (
    <th className={`px-3 py-2.5 font-display text-xs font-semibold uppercase tracking-wider ${al} ${className}`}>
      {children}
    </th>
  );
}

function NCell({ v, highlight }: { v: number; highlight?: boolean }) {
  return (
    <td
      className={`px-3 py-2.5 text-right font-mono text-sm ${
        v === 0 ? "text-gray-300" : highlight ? "font-semibold text-secondary-700" : "text-gray-800"
      }`}
    >
      {v === 0 ? "-" : v.toLocaleString("en-UG")}
    </td>
  );
}

function NTotalCell({ v }: { v: number }) {
  return (
    <td className="px-3 py-3 text-right font-mono font-bold text-white">
      {v === 0 ? "-" : v.toLocaleString("en-UG")}
    </td>
  );
}
