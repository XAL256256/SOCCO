"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

type Role = "ADMIN" | "CHAIRPERSON" | "TREASURER" | "SECRETARY" | "AUDITOR";

const OPTIONS: { role: Role; label: string }[] = [
  { role: "CHAIRPERSON", label: "Chairperson" },
  { role: "TREASURER", label: "Treasurer" },
  { role: "SECRETARY", label: "Secretary" },
  { role: "ADMIN", label: "Admin" },
  { role: "AUDITOR", label: "Auditor" },
];

type Props = {
  presentationCookie: string | null;
};

export function PresentationModeSwitcher({ presentationCookie }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const selectValue =
    presentationCookie && OPTIONS.some((o) => o.role === presentationCookie)
      ? presentationCookie
      : "";

  const apply = async (value: string) => {
    const role = value === "" ? null : (value as Role);
    setBusy(true);
    try {
      const res = await fetch("/api/presentation-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        role === null
          ? "Switched to Chairperson view"
          : `Switched to ${OPTIONS.find((o) => o.role === role)?.label ?? role} view`
      );
      router.refresh();
    } catch {
      toast.error("Could not switch view");
    } finally {
      setBusy(false);
    }
  };

  return (
    <label className="relative flex shrink-0 items-center gap-2">
      <span className="hidden text-[10px] font-mono uppercase tracking-wider text-sub xl:inline">
        View as
      </span>
      <div className="relative">
        <select
          aria-label="Switch role view"
          disabled={busy}
          value={selectValue}
          onChange={(e) => void apply(e.target.value)}
          className="appearance-none cursor-pointer rounded-md border border-line bg-surface py-2 pl-3 pr-9 text-xs font-semibold text-txt shadow-soft hover:border-line-h focus:border-growth focus:outline-none focus:ring-2 focus:ring-growth/15 disabled:opacity-50 max-w-[11rem] sm:max-w-none"
        >
          <option value="">Chairperson</option>
          {OPTIONS.filter((o) => o.role !== "CHAIRPERSON").map((o) => (
            <option key={o.role} value={o.role}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
      </div>
    </label>
  );
}
