"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const STORAGE_KEY = "nboog-demo-banner-dismissed";

export function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden border-b border-gold-bd bg-gold-dim"
        >
          <div className="flex items-center gap-3 px-4 sm:px-6 py-2.5">
            <span className="hidden sm:flex w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <p className="flex-1 font-mono text-[10px] tracking-[0.14em] uppercase text-gold">
              <span className="font-bold">Investor preview</span>
              <span className="hidden sm:inline text-gold/70 ml-2">
                · in-memory mock data · 45 members · ~250 contributions
              </span>
              <span className="sm:hidden text-gold/70 ml-2">· demo mode</span>
            </p>
            <button
              onClick={dismiss}
              aria-label="Dismiss banner"
              className="text-gold/70 hover:text-gold transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
