"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  separator?: boolean;
  precision?: number;
};

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1200,
  className,
  separator = true,
  precision = 0,
}: Props) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    let raf = 0;
    let start: number | null = null;

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (to - from) * eased;
      setDisplay(next);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const formatted = separator
    ? Number(display.toFixed(precision)).toLocaleString("en-UG", {
        maximumFractionDigits: precision,
      })
    : display.toFixed(precision);

  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {prefix}
      {prefix ? " " : ""}
      {formatted}
      {suffix}
    </motion.span>
  );
}
