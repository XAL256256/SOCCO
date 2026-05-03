import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUGX(value: number): string {
  return `UGX ${Math.round(value).toLocaleString("en-UG")}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-UG");
}

export function compactNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

export function initials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export function generateMemberNumber(seed: number): string {
  return `NBG-${String(seed).padStart(4, "0")}`;
}

export function generateReceiptNumber(seed: number, date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `RCT-${y}${m}${d}-${String(seed).padStart(3, "0")}`;
}
