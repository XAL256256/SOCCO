"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = HTMLMotionProps<"div"> & {
  variant?: "plain" | "organic" | "glow" | "gradient" | "glass";
  hover?: boolean;
};

export function Card({
  className,
  children,
  variant = "plain",
  hover,
  ...rest
}: Props) {
  const base = "bg-white p-6 shadow-elevated";
  const variants: Record<string, string> = {
    plain: "rounded-[24px]",
    organic: "rounded-[32px_8px_32px_8px] bg-gradient-to-br from-primary-50 to-white",
    glow: "rounded-[24px] shadow-floating hover:shadow-epic transition-shadow duration-300",
    gradient:
      "rounded-[32px] bg-gradient-to-br from-primary-500 to-primary-600 text-white relative overflow-hidden",
    glass: "rounded-[24px] glass",
  };

  return (
    <motion.div
      whileHover={hover ? { y: -6, transition: { type: "spring", stiffness: 350 } } : undefined}
      className={cn(base, variants[variant], className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
