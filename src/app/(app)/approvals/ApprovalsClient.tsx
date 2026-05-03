"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
          <p className="font-mono text-[9px] uppercase tracking-widest text-gold opacity-70">
            Chairperson &middot; {role}
          </p>
          <h1 className="font-syne text-2xl font-bold text-txt mt-1">Approvals</h1>
          <p className="font-mono text-[10px] text-dim tracking-widest uppercase mt-1">
            Pending decisions for loans and fines
          </p>
        </div>

        <section className="bg-surface border border-line rounded-[4px] overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center gap-2">
            <Wallet2 className="h-4 w-4 text-gold opacity-70" />
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-dim">
              Pending loan applications ({pendingLoans.length})
            </h2>
          </div>
          {pendingLoans.length === 0 ? (
            <p className="py-10 text-center font-mono text-[10px] text-dim tracking-widest uppercase">
              No loan applications waiting for review.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {pendingLoans.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-raised transition-colors"
                >
                  <div className="w-8 h-8 rounded-[2px] bg-gold-dim border border-gold-bd flex items-center justify-center flex-shrink-0">
                    <span className="font-syne font-bold text-gold text-[10px]">
                      {`${l.member.firstName[0]}${l.member.lastName[0]}`}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-dm text-sm font-medium text-txt">
                      {l.member.firstName} {l.member.lastName}
                    </p>
                    <p className="font-mono text-[9px] text-dim">
                      {l.loanNumber} &middot; {l.member.memberNumber} &middot; Applied{" "}
                      {format(new Date(l.appliedAt), "PP")}
                    </p>
                    {l.purpose && (
                      <p className="font-dm text-xs text-sub italic mt-0.5">
                        &ldquo;{l.purpose}&rdquo;
                      </p>
                    )}
                  </div>
                  <p className="font-mono font-bold text-gold" data-money>
                    {formatUGX(l.requestedAmount)}
                  </p>
                  <p className="font-mono text-xs text-dim">{l.termMonths} mo</p>
                  <Link href="/loans" className="btn-primary text-xs px-3 py-1.5">
                    Review
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-surface border border-line rounded-[4px] overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-danger opacity-70" />
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-dim">
              Outstanding fines ({outstandingFines.length})
            </h2>
          </div>
          {outstandingFines.length === 0 ? (
            <p className="py-10 text-center font-mono text-[10px] text-dim tracking-widest uppercase">
              No fines outstanding.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {outstandingFines.map((f) => (
                <li
                  key={f.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-raised transition-colors"
                >
                  <div className="w-8 h-8 rounded-[2px] bg-danger-dim border border-danger/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-syne font-bold text-danger text-[10px]">
                      {`${f.member.firstName[0]}${f.member.lastName[0]}`}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-dm text-sm font-medium text-txt">
                      {f.member.firstName} {f.member.lastName}
                    </p>
                    <p className="font-mono text-[9px] text-dim">
                      {f.member.memberNumber} &middot;{" "}
                      {format(new Date(f.createdAt), "PP")} &middot; {f.reason.replace(/_/g, " ")}
                    </p>
                    {f.description && (
                      <p className="font-dm text-xs text-sub mt-0.5">{f.description}</p>
                    )}
                  </div>
                  <p className="font-mono font-bold text-danger" data-money>
                    {formatUGX(f.amount)}
                  </p>
                  <button
                    onClick={() => setWaiving(f)}
                    className="font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-[2px] border border-danger/30 text-danger hover:bg-danger-dim transition-colors"
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
