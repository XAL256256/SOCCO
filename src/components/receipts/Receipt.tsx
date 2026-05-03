"use client";

import { format } from "date-fns";
import { CheckCircle2, Sparkles } from "lucide-react";
import { formatUGX } from "@/lib/utils";

export type ReceiptData = {
  receiptNumber: string;
  issuedAt: string | Date;
  member: { firstName: string; lastName: string; memberNumber: string; phoneNumber?: string | null };
  welfareAmount: number;
  savingsAmount: number;
  loanRepayment: number;
  fineAmount: number;
  shareAmount: number;
  registrationFee: number;
  otherAmount: number;
  otherDescription?: string | null;
  totalAmount: number;
  paymentMethod: string;
  reference?: string | null;
  integrityHash: string;
};

const items = (r: ReceiptData) =>
  [
    { label: "Welfare", value: r.welfareAmount },
    { label: "Savings", value: r.savingsAmount },
    { label: "Loan repayment", value: r.loanRepayment },
    { label: "Fine", value: r.fineAmount },
    { label: "Shares", value: r.shareAmount },
    { label: "Registration", value: r.registrationFee },
    {
      label: r.otherDescription || "Other",
      value: r.otherAmount,
    },
  ].filter((it) => it.value > 0);

export function Receipt({ data }: { data: ReceiptData }) {
  return (
    <div className="print-receipt mx-auto w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-floating">
      <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 p-7 text-white">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 animate-morphing" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-none">NBOOG SACCO</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary-100">
              Trust · Growth · Community
            </p>
          </div>
        </div>
        <p className="relative mt-6 text-xs font-mono uppercase tracking-widest text-primary-100">
          Official receipt
        </p>
        <p className="relative mt-1 font-mono text-2xl font-bold">{data.receiptNumber}</p>
      </div>

      <div className="p-7">
        <div className="flex items-center gap-2 text-secondary-700">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-semibold">Payment received with thanks</p>
        </div>

        <div className="mt-5 border-y-2 border-dashed border-gray-200 py-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">Member</p>
          <p className="mt-1 font-display font-bold text-lg">
            {data.member.firstName} {data.member.lastName}
          </p>
          <p className="font-mono text-xs text-gray-500">
            {data.member.memberNumber}
            {data.member.phoneNumber && ` · ${data.member.phoneNumber}`}
          </p>
        </div>

        <ul className="mt-5 space-y-2.5">
          {items(data).map((it) => (
            <li key={it.label} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{it.label}</span>
              <span className="font-mono font-semibold text-gray-900">
                {formatUGX(it.value)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-2xl bg-primary-50 p-5">
          <div className="flex items-center justify-between">
            <span className="font-display font-bold uppercase tracking-wider text-primary-900">
              Total
            </span>
            <span className="font-mono text-2xl font-bold text-primary-700">
              {formatUGX(data.totalAmount)}
            </span>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-gray-500 uppercase tracking-wider">Date</dt>
            <dd className="font-mono font-semibold">
              {format(new Date(data.issuedAt), "PPp")}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 uppercase tracking-wider">Method</dt>
            <dd className="font-mono font-semibold">
              {data.paymentMethod.replace("_", " ")}
            </dd>
          </div>
          {data.reference && (
            <div className="col-span-2">
              <dt className="text-gray-500 uppercase tracking-wider">Reference</dt>
              <dd className="font-mono font-semibold break-all">{data.reference}</dd>
            </div>
          )}
        </dl>

        <p className="mt-5 break-all border-t border-dashed border-gray-200 pt-3 font-mono text-[10px] text-gray-400">
          Verify · {data.integrityHash.slice(0, 32)}…
        </p>
      </div>
    </div>
  );
}
