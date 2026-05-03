"use client";

import { format } from "date-fns";
import { Eye, Phone, Printer, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Receipt, type ReceiptData } from "@/components/receipts/Receipt";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { formatUGX } from "@/lib/utils";

type Item = {
  id: string;
  receiptNumber: string;
  totalAmount: number;
  issuedAt: Date | string;
  integrityHash: string;
  member: {
    firstName: string;
    lastName: string;
    memberNumber: string;
    phoneNumber: string;
  };
  contribution: {
    welfareAmount: number;
    savingsAmount: number;
    loanRepayment: number;
    fineAmount: number;
    shareAmount: number;
    registrationFee: number;
    otherAmount: number;
    otherDescription: string | null;
    paymentMethod: string;
    reference: string | null;
  };
};

export function ReceiptsClient({ initial }: { initial: Item[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Item | null>(null);

  const filtered = useMemo(
    () =>
      initial.filter((r) => {
        if (!q) return true;
        const hay = `${r.receiptNumber} ${r.member.firstName} ${r.member.lastName} ${r.member.memberNumber} ${r.member.phoneNumber}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      }),
    [initial, q]
  );

  const sendWhatsApp = (r: Item) => {
    const phone = r.member.phoneNumber.replace(/\D/g, "");
    const text = encodeURIComponent(
      [
        "*NBOOG SACCO Receipt*",
        `Receipt: ${r.receiptNumber}`,
        `Member: ${r.member.firstName} ${r.member.lastName}`,
        `Total: ${formatUGX(r.totalAmount)}`,
        `Date: ${format(new Date(r.issuedAt), "PPp")}`,
        "",
        "Asante for your contribution! 🙏",
      ].join("\n")
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  const dataFor = (r: Item): ReceiptData => ({
    receiptNumber: r.receiptNumber,
    issuedAt: r.issuedAt,
    member: r.member,
    welfareAmount: r.contribution.welfareAmount,
    savingsAmount: r.contribution.savingsAmount,
    loanRepayment: r.contribution.loanRepayment,
    fineAmount: r.contribution.fineAmount,
    shareAmount: r.contribution.shareAmount,
    registrationFee: r.contribution.registrationFee,
    otherAmount: r.contribution.otherAmount,
    otherDescription: r.contribution.otherDescription,
    totalAmount: r.totalAmount,
    paymentMethod: r.contribution.paymentMethod,
    reference: r.contribution.reference,
    integrityHash: r.integrityHash,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Receipts</h1>
        <p className="text-sm text-gray-500">
          {initial.length} receipts issued · tap any row for details
        </p>
      </div>

      <div className="rounded-[28px] bg-white p-4 shadow-elevated sm:p-5">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leadingIcon={<Search className="h-4 w-4" />}
          placeholder="Search by receipt #, member, or phone…"
        />
      </div>

      <div className="rounded-[28px] bg-white shadow-elevated overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {filtered.map((r) => (
            <li
              key={r.id}
              id={r.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 hover:bg-primary-50/40"
            >
              <Avatar name={`${r.member.firstName} ${r.member.lastName}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {r.member.firstName} {r.member.lastName}
                </p>
                <p className="font-mono text-xs text-gray-500">
                  {r.receiptNumber} · {format(new Date(r.issuedAt), "PPp")}
                </p>
              </div>
              <p className="font-mono font-bold text-gray-900">
                {formatUGX(r.totalAmount)}
              </p>
              <div className="ml-2 flex gap-1.5">
                <button
                  onClick={() => setOpen(r)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700"
                  aria-label="View"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => sendWhatsApp(r)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                  aria-label="WhatsApp"
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500">No receipts match.</p>
        )}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} size="md" hideClose>
        {open && (
          <>
            <Receipt data={dataFor(open)} />
            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 no-print">
              <button onClick={() => setOpen(null)} className="btn-ghost">
                Close
              </button>
              <button onClick={() => window.print()} className="btn-outline">
                <Printer className="h-4 w-4" />
                Print
              </button>
              <MagneticButton variant="secondary" onClick={() => sendWhatsApp(open)}>
                <Phone className="h-4 w-4" />
                WhatsApp
              </MagneticButton>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
