"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  ChevronsUpDown,
  Coins,
  HandCoins,
  PiggyBank,
  Receipt as ReceiptIcon,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/Avatar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Input } from "@/components/ui/Input";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Modal } from "@/components/ui/Modal";
import { Receipt, type ReceiptData } from "@/components/receipts/Receipt";
import { formatUGX } from "@/lib/utils";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  memberNumber: string;
  phoneNumber: string;
};

type Meeting = { id: string; title: string; meetingDate: string };

type Defaults = { welfareAmount: number };

type Form = {
  memberId: string;
  meetingId: string;
  welfareAmount: string;
  savingsAmount: string;
  loanRepayment: string;
  fineAmount: string;
  shareAmount: string;
  registrationFee: string;
  otherAmount: string;
  otherDescription: string;
  paymentMethod: "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CHEQUE";
  reference: string;
  notes: string;
};

const FIELDS: {
  key: keyof Form;
  label: string;
  icon: typeof PiggyBank;
  tint: string;
}[] = [
  { key: "welfareAmount", label: "Welfare", icon: HandCoins, tint: "text-primary-700" },
  { key: "savingsAmount", label: "Savings", icon: PiggyBank, tint: "text-secondary-700" },
  { key: "loanRepayment", label: "Loan repayment", icon: Coins, tint: "text-accent-700" },
  { key: "fineAmount", label: "Fine", icon: ReceiptIcon, tint: "text-red-700" },
  { key: "shareAmount", label: "Shares", icon: Sparkles, tint: "text-info" },
  { key: "registrationFee", label: "Registration fee", icon: ReceiptIcon, tint: "text-gray-700" },
  { key: "otherAmount", label: "Other", icon: ReceiptIcon, tint: "text-gray-700" },
];

export function ContributionForm(props: {
  members: Member[];
  meetings: Meeting[];
  defaults: Defaults;
}) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}> 
      <ContributionFormInner {...props} />
    </Suspense>
  );
}

function ContributionFormInner({
  members,
  meetings,
  defaults,
}: {
  members: Member[];
  meetings: Meeting[];
  defaults: Defaults;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [memberSearch, setMemberSearch] = useState("");
  const [memberOpen, setMemberOpen] = useState(false);
  const [form, setForm] = useState<Form>({
    memberId: params.get("memberId") || "",
    meetingId: params.get("meetingId") || "",
    welfareAmount: "",
    savingsAmount: "",
    loanRepayment: "",
    fineAmount: "",
    shareAmount: "",
    registrationFee: "",
    otherAmount: "",
    otherDescription: "",
    paymentMethod: "CASH",
    reference: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const member = members.find((m) => m.id === form.memberId) ?? null;
  const filteredMembers = useMemo(
    () =>
      members.filter((m) => {
        if (!memberSearch) return true;
        const hay = `${m.firstName} ${m.lastName} ${m.memberNumber} ${m.phoneNumber}`.toLowerCase();
        return hay.includes(memberSearch.toLowerCase());
      }),
    [memberSearch, members]
  );

  const total = useMemo(() => {
    return (
      Number(form.welfareAmount || 0) +
      Number(form.savingsAmount || 0) +
      Number(form.loanRepayment || 0) +
      Number(form.fineAmount || 0) +
      Number(form.shareAmount || 0) +
      Number(form.registrationFee || 0) +
      Number(form.otherAmount || 0)
    );
  }, [form]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.memberId) {
      toast.error("Pick a member first");
      return;
    }
    if (total <= 0) {
      toast.error("Enter at least one amount");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          welfareAmount: Number(form.welfareAmount || 0),
          savingsAmount: Number(form.savingsAmount || 0),
          loanRepayment: Number(form.loanRepayment || 0),
          fineAmount: Number(form.fineAmount || 0),
          shareAmount: Number(form.shareAmount || 0),
          registrationFee: Number(form.registrationFee || 0),
          otherAmount: Number(form.otherAmount || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to log");
        return;
      }
      toast.success("Receipt generated");
      const r: ReceiptData = {
        receiptNumber: data.receipt.receiptNumber,
        issuedAt: data.receipt.issuedAt,
        member: member!,
        welfareAmount: data.contribution.welfareAmount,
        savingsAmount: data.contribution.savingsAmount,
        loanRepayment: data.contribution.loanRepayment,
        fineAmount: data.contribution.fineAmount,
        shareAmount: data.contribution.shareAmount,
        registrationFee: data.contribution.registrationFee,
        otherAmount: data.contribution.otherAmount,
        otherDescription: data.contribution.otherDescription,
        totalAmount: data.contribution.totalAmount,
        paymentMethod: data.contribution.paymentMethod,
        reference: data.contribution.reference,
        integrityHash: data.receipt.integrityHash,
      };
      setReceipt(r);
    } finally {
      setSubmitting(false);
    }
  };

  const sendWhatsApp = (r: ReceiptData) => {
    const phone = r.member.phoneNumber?.replace(/\D/g, "") ?? "";
    if (!phone) {
      toast.error("Member has no phone number on file");
      return;
    }
    const text = encodeURIComponent(
      [
        "*NBOOG SACCO Receipt*",
        `Receipt: ${r.receiptNumber}`,
        `Member: ${r.member.firstName} ${r.member.lastName}`,
        `Total: ${formatUGX(r.totalAmount)}`,
        r.welfareAmount > 0 ? `• Welfare: ${formatUGX(r.welfareAmount)}` : null,
        r.savingsAmount > 0 ? `• Savings: ${formatUGX(r.savingsAmount)}` : null,
        r.loanRepayment > 0 ? `• Loan: ${formatUGX(r.loanRepayment)}` : null,
        "",
        "Asante for your contribution! 🙏",
      ]
        .filter(Boolean)
        .join("\n")
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            Log a contribution
          </h1>
          <p className="text-sm text-gray-500">
            Record amounts received from a member. A receipt is generated automatically.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div className="rounded-[28px] bg-white p-5 shadow-elevated sm:p-6">
              <label className="label">Member</label>
              <button
                type="button"
                onClick={() => setMemberOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-primary-300"
              >
                {member ? (
                  <div className="flex items-center gap-3">
                    <Avatar name={`${member.firstName} ${member.lastName}`} />
                    <div>
                      <p className="font-semibold">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="font-mono text-xs text-gray-500">
                        {member.memberNumber} · {member.phoneNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">Choose a member…</span>
                )}
                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
              </button>

              <div className="mt-4">
                <label className="label">Meeting (optional)</label>
                <select
                  className="input"
                  value={form.meetingId}
                  onChange={(e) => setForm({ ...form, meetingId: e.target.value })}
                >
                  <option value="">Direct deposit (no meeting)</option>
                  {meetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} — {new Date(m.meetingDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-5 shadow-elevated sm:p-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gray-500">
                Amounts (UGX)
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {FIELDS.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.key}>
                      <Input
                        label={f.label}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        placeholder="0"
                        value={String(form[f.key])}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        leadingIcon={<Icon className={`h-4 w-4 ${f.tint}`} />}
                      />
                      {f.key === "welfareAmount" && (
                        <p className="mt-1 pl-1 text-[11px] text-gray-400 font-mono">
                          standard: 30,000 / month
                        </p>
                      )}
                      {f.key === "savingsAmount" && (
                        <p className="mt-1 pl-1 text-[11px] text-gray-400 font-mono">
                          minimum: 50,000
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              {Number(form.otherAmount || 0) > 0 && (
                <div className="mt-3">
                  <Input
                    label="Other description"
                    value={form.otherDescription}
                    onChange={(e) => setForm({ ...form, otherDescription: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="rounded-[28px] bg-white p-5 shadow-elevated sm:p-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gray-500">
                Payment
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Method</label>
                  <select
                    className="input"
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paymentMethod: e.target.value as Form["paymentMethod"],
                      })
                    }
                  >
                    <option value="CASH">Cash</option>
                    <option value="MOBILE_MONEY">Mobile money</option>
                    <option value="BANK_TRANSFER">Bank transfer</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <Input
                  label="Reference (optional)"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="Mobile money ID, cheque number…"
                />
              </div>
              <div className="mt-3">
                <label className="label">Notes (optional)</label>
                <textarea
                  className="input min-h-[80px]"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any context for the audit trail…"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => router.back()} className="btn-ghost">
                Cancel
              </button>
              <MagneticButton type="submit" loading={submitting}>
                Generate receipt
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </form>
        </div>

        {/* Sticky summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-[32px] bg-gradient-to-br from-primary-500 to-primary-700 p-7 text-white shadow-floating">
              <p className="font-mono text-xs uppercase tracking-widest text-primary-100">
                Total to receive
              </p>
              <div className="mt-3 font-mono text-5xl font-bold">
                <AnimatedNumber value={total} prefix="UGX" duration={500} />
              </div>
              {member && (
                <p className="mt-4 text-sm text-primary-100">
                  From {member.firstName} {member.lastName}
                </p>
              )}
            </div>

            <div className="rounded-[28px] bg-white p-5 shadow-elevated">
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-gray-500">
                Breakdown
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {FIELDS.map((f) => {
                  const v = Number(form[f.key] || 0);
                  if (v <= 0) return null;
                  return (
                    <li key={f.key} className="flex items-center justify-between">
                      <span className="text-gray-600">{f.label}</span>
                      <span className="font-mono font-semibold">{formatUGX(v)}</span>
                    </li>
                  );
                })}
                {total === 0 && (
                  <li className="text-sm text-gray-400 text-center py-6">
                    Enter amounts to preview
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Member picker modal */}
      <Modal
        open={memberOpen}
        onClose={() => setMemberOpen(false)}
        title="Choose member"
        size="md"
      >
        <Input
          autoFocus
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          leadingIcon={<Search className="h-4 w-4" />}
          placeholder="Search…"
        />
        <ul className="mt-3 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
          {filteredMembers.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, memberId: m.id });
                  setMemberOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-primary-50"
              >
                <Avatar name={`${m.firstName} ${m.lastName}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {m.firstName} {m.lastName}
                  </p>
                  <p className="font-mono text-xs text-gray-500">
                    {m.memberNumber} · {m.phoneNumber}
                  </p>
                </div>
              </button>
            </li>
          ))}
          {filteredMembers.length === 0 && (
            <li className="py-8 text-center text-sm text-gray-500">
              No matching members.
            </li>
          )}
        </ul>
      </Modal>

      {/* Receipt success modal */}
      <ReceiptSuccessModal
        receipt={receipt}
        onClose={() => {
          setReceipt(null);
          router.push("/receipts");
          router.refresh();
        }}
        onWhatsApp={(r) => sendWhatsApp(r)}
      />
    </>
  );
}

function ReceiptSuccessModal({
  receipt,
  onClose,
  onWhatsApp,
}: {
  receipt: ReceiptData | null;
  onClose: () => void;
  onWhatsApp: (r: ReceiptData) => void;
}) {
  if (!receipt) return null;

  return (
    <Modal open onClose={onClose} size="lg" hideClose>
      <Confetti />
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 text-white shadow-glow-green"
        >
          <CalendarCheck2 className="h-8 w-8" />
        </motion.div>
        <h2 className="font-display text-2xl font-bold">Receipt generated</h2>
        <p className="text-sm text-gray-500">Print, share via WhatsApp, or close.</p>
      </div>

      <div className="mt-6">
        <Receipt data={receipt} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <button onClick={onClose} className="btn-ghost">
          Close
        </button>
        <button onClick={() => window.print()} className="btn-outline no-print">
          Print
        </button>
        <MagneticButton variant="secondary" onClick={() => onWhatsApp(receipt)}>
          Send via WhatsApp
        </MagneticButton>
      </div>
    </Modal>
  );
}

function Confetti() {
  // Lightweight CSS confetti — no extra dependencies.
  const pieces = Array.from({ length: 36 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const colors = ["#ec5a2e", "#16a34a", "#eab308", "#0891b2", "#f47d53"];
        const color = colors[i % colors.length];
        const left = (i * 13) % 100;
        const delay = (i * 0.07) % 1.2;
        const duration = 1.4 + ((i * 17) % 9) / 10;
        return (
          <motion.span
            key={i}
            initial={{ y: -20, x: `${left}%`, opacity: 0, rotate: 0 }}
            animate={{ y: "120%", opacity: [0, 1, 1, 0], rotate: 540 }}
            transition={{ duration, delay, ease: "easeOut" }}
            className="absolute top-0 h-2 w-2"
            style={{ background: color, borderRadius: "2px" }}
          />
        );
      })}
    </div>
  );
}
