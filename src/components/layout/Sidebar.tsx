"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  CalendarCheck2,
  Fingerprint,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: string[];
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/meetings", label: "Meetings", icon: CalendarCheck2 },
  { href: "/attendance", label: "Attendance", icon: Fingerprint },
  { href: "/contributions", label: "Contributions", icon: HandCoins },
  { href: "/loans", label: "Loans", icon: Wallet2 },
  { href: "/approvals", label: "Approvals", icon: ShieldCheck, roles: ["ADMIN", "CHAIRPERSON"] },
  { href: "/receipts", label: "Receipts", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

type Props = {
  user: { fullName: string; role: string };
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({ user, open = false, onClose }: Props) {
  const pathname = usePathname();
  const visible = NAV.filter((n) => !n.roles || n.roles.includes(user.role));

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    window.location.href = "/login";
  };

  const content = (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-4 text-white shadow-floating relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 animate-morphing" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display font-bold leading-none">NBOOG</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-primary-100">
                SACCO
              </p>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            className="lg:hidden text-white/80 hover:text-white relative"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto no-scrollbar">
        <ul className="space-y-1">
          {visible.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-2xl bg-primary-100/80 ring-1 ring-primary-200"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        active ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                      )}
                    />
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-soft">
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.fullName}
            </p>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
              {user.role.toLowerCase()}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-full p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-svh w-72 shrink-0 border-r border-gray-100 bg-white/70 backdrop-blur lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-white shadow-epic lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
