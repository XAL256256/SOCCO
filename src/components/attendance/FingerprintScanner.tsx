"use client";

import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";

export function FingerprintScanner({
  scanning,
  onClick,
}: {
  scanning: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-grid place-items-center"
      aria-label="Tap to mark attendance"
    >
      {scanning &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute h-44 w-44 rounded-full border-4 border-primary-300"
            initial={{ scale: 0.95, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
      <motion.div
        animate={
          scanning
            ? { scale: [1, 1.05, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }
            : {}
        }
        transition={{ duration: 1.5, repeat: scanning ? Infinity : 0, ease: "easeInOut" }}
        className="relative grid h-44 w-44 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-epic"
      >
        <Fingerprint className="h-20 w-20" />
        {scanning && (
          <motion.span
            className="absolute left-3 right-3 h-0.5 bg-accent-400"
            style={{
              boxShadow: "0 0 16px rgba(234,179,8,0.7)",
              filter: "blur(0.5px)",
            }}
            animate={{ top: ["20%", "80%", "20%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>
    </button>
  );
}
