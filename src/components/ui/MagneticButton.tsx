"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "accent" | "outline" | "ghost";

type Props = Omit<HTMLMotionProps<"button">, "ref"> & {
  variant?: Variant;
  fullWidth?: boolean;
  loading?: boolean;
  magneticStrength?: number;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-elevated hover:shadow-floating",
  secondary:
    "bg-gradient-to-br from-secondary-500 to-secondary-600 text-white shadow-elevated hover:shadow-glow-green",
  accent:
    "bg-gradient-to-br from-accent-400 to-accent-500 text-gray-900 shadow-elevated hover:shadow-glow-gold",
  outline:
    "bg-white text-primary-700 border-2 border-primary-200 hover:border-primary-500 hover:bg-primary-50",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
};

export function MagneticButton({
  className,
  children,
  variant = "primary",
  fullWidth,
  loading,
  disabled,
  magneticStrength = 0.25,
  ...rest
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({
      x: (e.clientX - (r.left + r.width / 2)) * magneticStrength,
      y: (e.clientY - (r.top + r.height / 2)) * magneticStrength,
    });
  };
  const onLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2",
        "px-6 py-3 rounded-2xl font-display font-semibold",
        "transition-shadow duration-300 overflow-hidden whitespace-nowrap",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {/* Shine sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full hover:translate-x-[200%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        {loading && (
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children as React.ReactNode}
      </span>
    </motion.button>
  );
}
