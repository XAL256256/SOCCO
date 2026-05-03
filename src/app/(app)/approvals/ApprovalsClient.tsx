"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ShieldCheck, Wallet2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { formatUGX } from "@/lib/utils";

type Loan = {
  id: string;
  loanNumber: string;
  requestedAmount: number;
  termMonths: number;
  purpose: string | null;
  appliedAt: string;
  member: { firstName: string; lastName: string; memberNumber: string };
};
type Fine = {
  id: string;
  reason: string;
  amount: number;
  description: string | null;
  createdAt: string;
  member: { firstName: string; lastName: string; memberNumber: string };
};

export function ApprovalsClient({
  role,
  pendingLoans,
  outstandingFines,
}: {
  role: string;
  pendingLoans: Loan[];
  outstandingFines: Fine[];
}) {
  const router = useRouter();
  const [waiving, setWaiving] = useState<Fine | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const waive = async () => {
    if (!waiving) return;
    if (reason.trim().length < 2) {
      toast.error("Please provide a reason");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/fines/${waiving.id}/waive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      toast.success("Fine waived");
      setWaiving(null);
      setReason("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary-600">
            Chairperson · {role}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            Approvals
          </h1>
          <p className="text-sm text-gray-500">
            Pending decisions for loans, fines, and absences.
          </p>
        </div>

        <section className="rounded-[28px] bg-white p-5 shadow-elevated sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Wallet2 className="h-4 w-4 text-primary-700" />
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gray-700">
              Pending loan applications ({pendingLoans.length})
            </h2>
          </div>
          {pendingLoans.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No loan applications waiting for review.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pendingLoans.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <Avatar name={`${l.member.firstName} ${l.member.lastName}`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {l.member.firstName} {l.member.lastName}
                    </p>
                    <p className="font-mono text-xs text-gray-500">
                      {l.loanNumber} · {l.member.memberNumber} · Applied{" "}
                      {format(new Date(l.appliedAt), "PP")}
                    </p>
                    {l.purpose && (
                      <p className="text-xs italic text-gray-600 mt-1">
                        &ldquo;{l.purpose}&rdquo;
                      </p>
                    )}
                  </div>
                  <p className="font-mono font-bold">
                    {formatUGX(l.requestedAmount)}
                  </p>
                  <p className="text-xs text-gray-500">{l.termMonths} mo</p>
                  <Link
                    href={`/loans`}
                    className="btn-primary !py-2 !px-3 text-sm"
                  >
                    Review
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-elevated sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-secondary-600" />
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gray-700">
              Outstanding fines ({outstandingFines.length})
            </h2>
          </div>
          {outstandingFines.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No fines outstanding. 🎉
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {outstandingFines.map((f) => (
                <li
                  key={f.id}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <Avatar name={`${f.member.firstName} ${f.member.lastName}`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {f.member.firstName} {f.member.lastName}
                    </p>
                    <p className="font-mono text-xs text-gray-500">
                      {f.member.memberNumber} ·{" "}
                      {format(new Date(f.createdAt), "PP")} · {f.reason.replace(/_/g, " ")}
                    </p>
                    {f.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {f.description}
                      </p>
                    )}
                  </div>
                  <p className="font-mono font-bold text-red-600">
                    {formatUGX(f.amount)}
                  </p>
                  <button
                    onClick={() => setWaiving(f)}
                    className="btn-outline !py-2 !px-3 text-sm"
                  >
                    Waive
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Modal
        open={!!waiving}
        onClose={() => {
          setWaiving(null);
          setReason("");
        }}
        title="Waive fine"
      >
        {waiving && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Waiving{" "}
              <span className="font-bold">{formatUGX(waiving.amount)}</span> for{" "}
              <span className="font-semibold">
                {waiving.member.firstName} {waiving.member.lastName}
              </span>
              .
            </p>
            <Input
              label="Reason (recorded in audit log)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. genuine emergency"
              required
            />
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setWaiving(null);
                  setReason("");
                }}
                className="btn-ghost"
              >
                Cancel
              </button>
              <MagneticButton onClick={waive} loading={loading}>
                Confirm waive
              </MagneticButton>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
