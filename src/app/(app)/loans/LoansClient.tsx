"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  Plus,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Modal } from "@/components/ui/Modal";
import { formatUGX } from "@/lib/utils";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  memberNumber: string;
  phoneNumber: string;
};

type Loan = {
  id: string;
  loanNumber: string;
  memberId: string;
  principalAmount: number;
  requestedAmount: number;
  interestRate: number;
  termMonths: number;
  status: string;
  purpose: string | null;
  guarantors: string | null;
  amountRepaid: number;
  appliedAt: string;
  approvedAt: string | null;
  disbursedAt: string | null;
  dueAt: string | null;
  rejectedReason: string | null;
  member: Member;
  schedule: {
    id: string;
    dueDate: string;
    amount: number;
    paidAmount: number;
    status: string;
    paidAt: string | null;
  }[];
};

const STATUS_CHIPS: Record<string, string> = {
  PENDING: "chip-accent",
  APPROVED: "chip-secondary",
  DISBURSED: "chip-secondary",
  ACTIVE: "chip-secondary",
  PAID: "chip-gray",
  REJECTED: "chip-danger",
  DEFAULTED: "chip-danger",
  WRITTEN_OFF: "chip-gray",
};

const TABS = ["PENDING", "APPROVED", "DISBURSED", "PAID", "REJECTED"] as const;
type Tab = (typeof TABS)[number];

export function LoansClient({
  loans,
  members,
  role,
}: {
  loans: Loan[];
  members: Member[];
  role: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("PENDING");
  const [creating, setCreating] = useState(false);
  const [reviewing, setReviewing] = useState<Loan | null>(null);

  const isChair = role === "ADMIN" || role === "CHAIRPERSON";

  const filtered = useMemo(
    () => loans.filter((l) => l.status === tab),
    [loans, tab]
  );

  const counts: Record<Tab, number> = {
    PENDING: 0,
    APPROVED: 0,
    DISBURSED: 0,
    PAID: 0,
    REJECTED: 0,
  };
  for (const l of loans) {
    if (l.status in counts) counts[l.status as Tab]++;
  }

  const totals = {
    outstanding: loans
      .filter((l) => l.status === "DISBURSED" || l.status === "ACTIVE")
      .reduce((a, l) => a + (l.principalAmount - l.amountRepaid), 0),
    pending: loans.filter((l) => l.status === "PENDING").reduce((a, l) => a + l.requestedAmount, 0),
    disbursed: loans.filter((l) => l.status === "DISBURSED").length,
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Loans
            </h1>
            <p className="text-sm text-gray-500">
              {loans.length} total · {counts.PENDING} awaiting approval
            </p>
          </div>
          <MagneticButton onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            New application
          </MagneticButton>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KPI
            label="Outstanding loans"
            value={formatUGX(totals.outstanding)}
            icon={<Coins className="h-5 w-5" />}
            tint="bg-primary-50 text-primary-700 border-primary-200"
          />
          <KPI
            label="Pending approval"
            value={formatUGX(totals.pending)}
            icon={<AlertTriangle className="h-5 w-5" />}
            tint="bg-accent-50 text-accent-800 border-accent-200"
          />
          <KPI
            label="Active disbursements"
            value={String(totals.disbursed)}
            icon={<ShieldCheck className="h-5 w-5" />}
            tint="bg-secondary-50 text-secondary-700 border-secondary-200"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-2xl bg-gray-100 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                tab === t ? "text-white" : "text-gray-600"
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="loans-tab-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-glow"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">
                {t} <span className="font-mono opacity-70">({counts[t]})</span>
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="rounded-[28px] bg-white shadow-elevated">
          <ul className="divide-y divide-gray-100">
            {filtered.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6"
              >
                <Avatar name={`${l.member.firstName} ${l.member.lastName}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {l.member.firstName} {l.member.lastName}
                  </p>
                  <p className="font-mono text-xs text-gray-500">
                    {l.loanNumber} · Applied {format(new Date(l.appliedAt), "PP")} · {l.termMonths} months
                  </p>
                  {l.purpose && (
                    <p className="mt-1 text-xs text-gray-600 italic">
                      &ldquo;{l.purpose}&rdquo;
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">
                    {formatUGX(l.principalAmount)}
                  </p>
                  <span className={STATUS_CHIPS[l.status] ?? "chip-gray"}>
                    {l.status}
                  </span>
                </div>
                <button
                  className="ml-2 btn-outline !py-2 !px-3 text-sm"
                  onClick={() => setReviewing(l)}
                >
                  Details
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="py-12 text-center text-sm text-gray-500">
                No loans in {tab.toLowerCase()} state.
              </li>
            )}
          </ul>
        </div>
      </div>

      <NewLoanModal
        open={creating}
        onClose={() => setCreating(false)}
        members={members}
        onCreated={() => {
          setCreating(false);
          router.refresh();
        }}
      />

      <LoanDetailsModal
        loan={reviewing}
        onClose={() => setReviewing(null)}
        canApprove={isChair}
        onChange={() => {
          setReviewing(null);
          router.refresh();
        }}
      />
    </>
  );
}

function KPI({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tint: string;
}) {
  return (
    <div className={`rounded-[24px] border-2 p-5 ${tint}`}>
      <div className="flex items-start justify-between">
        <p className="font-mono text-xs uppercase tracking-widest opacity-80">
          {label}
        </p>
        {icon}
      </div>
      <p className="mt-3 font-mono text-2xl font-bold">{value}</p>
    </div>
  );
}

function NewLoanModal({
  open,
  onClose,
  members,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  members: Member[];
  onCreated: () => void;
}) {
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [months, setMonths] = useState("6");
  const [purpose, setPurpose] = useState("");
  const [guarantors, setGuarantors] = useState("");
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState<{
    ok: boolean;
    reasons: string[];
    maxAllowed: number;
    currentSavings: number;
  } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) {
      toast.error("Pick a member");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          requestedAmount: Number(amount),
          termMonths: Number(months),
          purpose,
          guarantors,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      setEligibility(data.eligibility);
      toast.success("Application submitted — awaiting chairperson");
      // Show eligibility briefly, then refresh
      setTimeout(() => {
        setEligibility(null);
        onCreated();
      }, 2200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New loan application" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Member</label>
          <select
            className="input"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
          >
            <option value="">Choose…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.lastName} {m.firstName} ({m.memberNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Requested amount (UGX)"
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Input
            label="Term (months)"
            type="number"
            min={1}
            max={60}
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            required
          />
        </div>

        <Input
          label="Purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="What will the loan be used for?"
          required
        />
        <Input
          label="Guarantors (member numbers, comma separated)"
          value={guarantors}
          onChange={(e) => setGuarantors(e.target.value)}
          placeholder="NBG-0005, NBG-0012"
        />

        {eligibility && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 text-sm ${
              eligibility.ok
                ? "bg-secondary-50 text-secondary-800 border border-secondary-200"
                : "bg-accent-50 text-accent-800 border border-accent-200"
            }`}
          >
            <p className="font-semibold mb-1">
              {eligibility.ok
                ? "Eligibility passed"
                : "Eligibility flags (chairperson can override)"}
            </p>
            <p className="text-xs">
              Current savings: {formatUGX(eligibility.currentSavings)} · Max
              allowed: {formatUGX(eligibility.maxAllowed)}
            </p>
            {!eligibility.ok && (
              <ul className="mt-2 list-disc pl-5">
                {eligibility.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <MagneticButton type="submit" loading={loading}>
            Submit application
          </MagneticButton>
        </div>
      </form>
    </Modal>
  );
}

function LoanDetailsModal({
  loan,
  onClose,
  canApprove,
  onChange,
}: {
  loan: Loan | null;
  onClose: () => void;
  canApprove: boolean;
  onChange: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [approvedAmount, setApprovedAmount] = useState<string>(
    String(loan?.requestedAmount ?? "")
  );

  if (!loan) return null;

  const action = async (act: "APPROVE" | "REJECT", disburse = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/loans/${loan.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: act,
          approvedAmount: act === "APPROVE" ? Number(approvedAmount) : undefined,
          rejectedReason: act === "REJECT" ? reason : undefined,
          disburse,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      toast.success(
        act === "APPROVE"
          ? disburse
            ? "Loan approved & disbursed"
            : "Loan approved"
          : "Loan rejected"
      );
      onChange();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`${loan.loanNumber} · ${loan.member.firstName} ${loan.member.lastName}`} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Requested" value={formatUGX(loan.requestedAmount)} />
          <Field label="Approved" value={formatUGX(loan.principalAmount)} />
          <Field label="Term" value={`${loan.termMonths} months`} />
          <Field label="Rate" value={`${(loan.interestRate * 100).toFixed(0)}%`} />
        </div>

        {loan.purpose && (
          <div className="rounded-2xl bg-gray-50 p-4 text-sm italic text-gray-700">
            &ldquo;{loan.purpose}&rdquo;
          </div>
        )}
        {loan.rejectedReason && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            <p className="font-semibold">Rejection reason</p>
            <p>{loan.rejectedReason}</p>
          </div>
        )}

        {/* Schedule */}
        {loan.schedule.length > 0 && (
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">
              Repayment schedule
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-primary-50 text-primary-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-display text-xs uppercase tracking-wider">
                      Due
                    </th>
                    <th className="px-3 py-2 text-right font-display text-xs uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-right font-display text-xs uppercase tracking-wider">
                      Paid
                    </th>
                    <th className="px-3 py-2 text-right font-display text-xs uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loan.schedule.map((s) => (
                    <tr key={s.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-mono text-xs">
                        {format(new Date(s.dueDate), "PP")}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatUGX(s.amount)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatUGX(s.paidAmount)}
                      </td>
                      <td className="px-3 py-2 text-right">
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
              </table>
            </div>
          </div>
        )}

        {canApprove && loan.status === "PENDING" && (
          <div className="space-y-3 rounded-2xl border border-gray-100 p-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-gray-500">
              Chairperson decision
            </h3>
            <Input
              label="Approved amount"
              type="number"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
            />
            <Input
              label="Rejection reason (only used if rejecting)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                disabled={loading}
                onClick={() => action("REJECT")}
                className="btn-outline"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
              <button
                disabled={loading}
                onClick={() => action("APPROVE", false)}
                className="btn-secondary"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </button>
              <MagneticButton
                disabled={loading}
                onClick={() => action("APPROVE", true)}
              >
                Approve & disburse
              </MagneticButton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className="mt-1 font-mono font-semibold">{value}</p>
    </div>
  );
}
