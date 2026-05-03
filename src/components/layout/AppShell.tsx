"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { DemoBanner } from "./DemoBanner";

type Props = {
  user: { fullName: string; role: string };
  presentationCookie: string | null;
  children: React.ReactNode;
};

export function AppShell({ user, presentationCookie, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-bg">
      <Sidebar user={user} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DemoBanner />
        <Topbar
          user={user}
          presentationCookie={presentationCookie}
          onOpenMenu={() => setMenuOpen(true)}
        />
        <main className="relative flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
