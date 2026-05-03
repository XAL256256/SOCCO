import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

type Props = {
  delta?: number; // percentage change (e.g. +12 = +12%)
  label?: string;
  className?: string;
};

export function StatBadge({ delta, label, className }: Props) {
  const positive = (delta ?? 0) > 0;
  const negative = (delta ?? 0) < 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        positive && "bg-secondary-100 text-secondary-800",
        negative && "bg-red-100 text-red-700",
        !positive && !negative && "bg-gray-100 text-gray-600",
        className
      )}
    >
      {positive && <TrendingUp className="h-3.5 w-3.5" />}
      {negative && <TrendingDown className="h-3.5 w-3.5" />}
      {!positive && !negative && <Minus className="h-3.5 w-3.5" />}
      <span>
        {delta !== undefined ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%` : "—"}
      </span>
      {label && <span className="text-gray-500 font-normal">{label}</span>}
    </div>
  );
}
