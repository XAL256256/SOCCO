"use client";

import { Bell, Menu } from "lucide-react";
import { PresentationModeSwitcher } from "./PresentationModeSwitcher";

type Props = {
  user: { fullName: string; role: string };
  presentationCookie: string | null;
  onOpenMenu?: () => void;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Topbar({ user, presentationCookie, onOpenMenu }: Props) {
  return (
    <header className="h-14 flex-shrink-0 border-b border-line bg-bg flex items-center gap-3 px-4 sm:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={onOpenMenu}
        className="lg:hidden w-8 h-8 flex items-center justify-center text-dim hover:text-sub transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile brand */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-7 h-7 bg-gold flex items-center justify-center font-syne font-black text-bg text-xs rounded-[2px]">
          N
        </div>
        <span className="font-syne font-bold text-txt text-sm tracking-wide uppercase">NBOOG</span>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Presentation mode switcher */}
        <PresentationModeSwitcher presentationCookie={presentationCookie} />

        {/* Bell */}
        <button className="relative w-8 h-8 flex items-center justify-center text-dim hover:text-sub transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-line" />

        {/* User identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gold-dim border border-gold-bd rounded-[2px] flex items-center justify-center flex-shrink-0">
            <span className="font-syne font-bold text-gold text-xs">{initials(user.fullName)}</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="font-dm text-sm font-semibold text-txt leading-none">
              {user.fullName.split(" ")[0]}
            </p>
            <p className="font-mono text-[9px] text-gold tracking-widest uppercase mt-0.5">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
