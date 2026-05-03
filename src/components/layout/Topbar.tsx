"use client";

import { motion } from "framer-motion";
import { Bell, Menu, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { PresentationModeSwitcher } from "./PresentationModeSwitcher";

type Props = {
  user: { fullName: string; role: string };
  presentationCookie: string | null;
  onOpenMenu?: () => void;
};

export function Topbar({ user, presentationCookie, onOpenMenu }: Props) {
  const [q, setQ] = useState("");
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/70 backdrop-blur-xl">
      <div className="flex h-16 flex-wrap items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <button
          onClick={onOpenMenu}
          className="lg:hidden grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white shadow-soft text-gray-700"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display font-bold">NBOOG</span>
        </div>

        <div className="relative order-last hidden min-w-0 flex-1 sm:order-none sm:ml-0 sm:mr-auto sm:block sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search members, receipts, meetings…"
            className="w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
          />
        </div>

        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <PresentationModeSwitcher presentationCookie={presentationCookie} />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-soft text-gray-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white animate-pulse" />
          </motion.button>

          <div className="flex items-center gap-2 border-l border-gray-100 pl-2 sm:gap-3 sm:pl-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">
                {user.fullName.split(" ")[0]}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">
                {user.role}
              </p>
            </div>
            <Avatar name={user.fullName} size="md" />
          </div>
        </div>
      </div>
    </header>
  );
}
