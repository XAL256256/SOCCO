import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:      "oklch(12% 0.01 250)",
        surface: "oklch(16% 0.012 250)",
        raised:  "oklch(20% 0.014 250)",
        gold:    "oklch(75% 0.15 85)",
        "gold-dim": "oklch(75% 0.15 85 / 0.12)",
        "gold-bd":  "oklch(75% 0.15 85 / 0.25)",
        growth:  "oklch(65% 0.18 155)",
        "growth-dim": "oklch(65% 0.18 155 / 0.1)",
        danger:  "oklch(55% 0.2 25)",
        "danger-dim": "oklch(55% 0.2 25 / 0.1)",
        line:    "oklch(30% 0.02 250 / 0.5)",
        "line-h":"oklch(40% 0.02 250 / 0.6)",
        txt:     "oklch(94% 0.005 250)",
        sub:     "oklch(60% 0.01 250)",
        dim:     "oklch(40% 0.01 250)",
      },
      fontFamily: {
        syne:  ["var(--font-syne)", "sans-serif"],
        dm:    ["var(--font-dm)", "sans-serif"],
        mono:  ["var(--font-mono)", "monospace"],
        // keep old aliases so existing pages don't break
        display: ["var(--font-syne)", "sans-serif"],
        body:    ["var(--font-dm)", "sans-serif"],
        sans:    ["var(--font-dm)", "sans-serif"],
      },
      borderRadius: {
        "2":  "2px",
        "4":  "4px",
        "6":  "6px",
      },
      keyframes: {
        "pulse-gold": {
          "0%,100%": { boxShadow: "0 0 0 0 oklch(75% 0.15 85 / 0.3)" },
          "50%":  { boxShadow: "0 0 0 8px oklch(75% 0.15 85 / 0)" },
        },
        "count-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "count-in":   "count-in 0.4s ease-out forwards",
        shimmer:      "shimmer 2s linear infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
