"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function YearPicker({ years, current }: { years: number[]; current: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const set = (y: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("year", String(y));
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
      {years.map((y) => (
        <button
          key={y}
          onClick={() => set(y)}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            y === current
              ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-glow"
              : "text-gray-600 hover:bg-white"
          }`}
        >
          {y}
        </button>
      ))}
    </div>
  );
}

export function MonthPicker({
  current,
  year,
}: {
  current: number; // 0-11
  year: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const set = (m: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("month", String(m));
    sp.set("year", String(year));
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <select
      className="rounded-2xl border-2 border-gray-200 bg-white px-3 py-2 text-sm font-semibold focus:border-primary-500"
      value={current}
      onChange={(e) => set(Number(e.target.value))}
    >
      {Array.from({ length: 12 }).map((_, m) => (
        <option key={m} value={m}>
          {new Date(year, m, 1).toLocaleString("en-UG", { month: "long" })}
        </option>
      ))}
    </select>
  );
}
