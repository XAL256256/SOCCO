import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, HandCoins } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listContributions } from "@/lib/mock/queries";
import { formatUGX } from "@/lib/utils";

export const dynamic = "force-dynamic";

function Initials({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-[2px] bg-gold-dim border border-gold-bd flex items-center justify-center flex-shrink-0">
      <span className="font-syne font-bold text-gold text-[10px]">
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </span>
    </div>
  );
}

export default async function ContributionsPage() {
  await requireUser();
  const items = listContributions({ limit: 100 });

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-syne text-2xl font-bold text-txt">Contributions</h1>
          <p className="font-mono text-[10px] text-dim tracking-widest uppercase mt-1">
            Last {items.length} contributions across all meetings
          </p>
        </div>
        <Link href="/contributions/new" className="btn-primary flex items-center gap-2">
          <HandCoins className="h-4 w-4" />
          Log contribution
        </Link>
      </div>

      <div className="bg-surface border border-line rounded-[4px] overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-4 px-5 py-2.5 border-b border-line">
          <span className="col-span-4 font-mono text-[9px] text-dim tracking-[0.1em] uppercase">Member</span>
          <span className="col-span-3 font-mono text-[9px] text-dim tracking-[0.1em] uppercase">Meeting</span>
          <span className="col-span-2 font-mono text-[9px] text-dim tracking-[0.1em] uppercase">Date</span>
          <span className="col-span-2 font-mono text-[9px] text-dim tracking-[0.1em] uppercase">Amount</span>
          <span className="col-span-1 font-mono text-[9px] text-dim tracking-[0.1em] uppercase">Receipt</span>
        </div>

        {items.length === 0 ? (
          <p className="py-12 text-center font-mono text-[10px] text-dim tracking-widest uppercase">
            No contributions yet.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((c) => (
              <li
                key={c.id}
                className="grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-raised transition-colors duration-150"
              >
                {/* Member */}
                <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                  <Initials name={`${c.member.firstName} ${c.member.lastName}`} />
                  <div className="min-w-0">
                    <p className="font-dm text-sm text-txt truncate">
                      {c.member.firstName} {c.member.lastName}
                    </p>
                    <p className="font-mono text-[9px] text-dim">{c.member.memberNumber}</p>
                  </div>
                </div>
                {/* Meeting */}
                <div className="col-span-3">
                  <p className="font-dm text-xs text-sub truncate">
                    {c.meeting?.title ?? "Direct deposit"}
                  </p>
                </div>
                {/* Date */}
                <div className="col-span-2">
                  <p className="font-mono text-[10px] text-dim">{format(c.createdAt, "dd MMM yyyy")}</p>
                </div>
                {/* Amount */}
                <div className="col-span-2">
                  <p className="font-mono text-sm text-gold" data-money>
                    {formatUGX(c.totalAmount)}
                  </p>
                </div>
                {/* Receipt */}
                <div className="col-span-1">
                  {c.receipt ? (
                    <Link
                      href={`/receipts#${c.receipt.id}`}
                      className="inline-flex items-center gap-0.5 font-mono text-[9px] text-gold hover:text-txt tracking-wider transition-colors"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-dim">—</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
