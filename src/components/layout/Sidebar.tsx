"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarDays, ClipboardCheck,
  Wallet, Landmark, ShieldCheck, Receipt, BarChart3,
  Settings, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: string[];
};

const NAV: NavItem[] = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/members",       label: "Members",        icon: Users },
  { href: "/meetings",      label: "Meetings",       icon: CalendarDays },
  { href: "/attendance",    label: "Attendance",     icon: ClipboardCheck },
  { href: "/contributions", label: "Contributions",  icon: Wallet },
  { href: "/loans",         label: "Loans",          icon: Landmark },
  { href: "/approvals",     label: "Approvals",      icon: ShieldCheck, roles: ["ADMIN", "CHAIRPERSON"] },
  { href: "/receipts",      label: "Receipts",       icon: Receipt },
  { href: "/reports",       label: "Reports",        icon: BarChart3 },
  { href: "/settings",      label: "Settings",       icon: Settings },
];

type Props = {
  user: { fullName: string; role: string };
  open?: boolean;
  onClose?: () => void;
};

function SidebarContent({
  user,
  collapsed,
  setCollapsed,
  onClose,
}: {
  user: Props["user"];
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const visible = NAV.filter((n) => !n.roles || n.roles.includes(user.role));

  return (
    <div className="flex h-full flex-col bg-surface border-r border-line">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-line min-h-[64px]">
        <div className="w-8 h-8 flex-shrink-0 bg-gold flex items-center justify-center font-syne font-black text-bg text-sm rounded-[2px]">
          N
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col min-w-0"
            >
              <span className="font-syne font-bold text-txt text-sm leading-none tracking-wide uppercase">
                NBOOG
              </span>
              <span className="font-mono text-gold text-[9px] tracking-[0.2em] uppercase mt-0.5">
                SACCO
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-dim hover:text-sub transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div
                className={cn(
                  "relative flex items-center gap-3 px-4 py-2.5 mx-2 transition-all duration-150 group",
                  active ? "text-gold" : "text-sub hover:text-txt"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-[4px] bg-gold-dim border border-gold-bd"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                {active && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-gold rounded-full" />
                )}
                <item.icon size={15} className="relative z-10 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="relative z-10 font-dm text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="border-t border-line p-3 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 text-dim hover:text-sub transition-colors py-1.5"
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <>
              <ChevronLeft size={14} />
              <span className="font-mono text-[9px] tracking-widest uppercase">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ user, open = false, onClose }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop — animated width */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 hidden h-svh flex-shrink-0 lg:block overflow-hidden"
      >
        <SidebarContent
          user={user}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] lg:hidden overflow-hidden"
            >
              <SidebarContent
                user={user}
                collapsed={false}
                setCollapsed={() => {}}
                onClose={onClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
