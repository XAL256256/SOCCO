import type { Config } from "tailwindcss";

const primary = {
  50:  "#EAF4EE",
  100: "#C8E1D2",
  200: "#9FC9AF",
  300: "#74AE8B",
  400: "#4D9468",
  500: "#2F7E4F",
  600: "#1F6A40",
  700: "#155232",
  800: "#0E3D26",
  900: "#0A2A1A",
};

const secondary = {
  50:  "#FAF6EC",
  100: "#F0E6C9",
  200: "#E0CD96",
  300: "#CDB061",
  400: "#B7943B",
  500: "#9A7B26",
  600: "#7C611C",
  700: "#5C4815",
  800: "#3F310F",
  900: "#221A06",
};

const accent = {
  50:  "#FBEFEA",
  100: "#F5D5C9",
  200: "#ECB29D",
  300: "#DE886C",
  400: "#CA6B4C",
  500: "#B05334",
  600: "#8E4127",
  700: "#6A301D",
  800: "#441E12",
  900: "#240F09",
};

const neutral = {
  50:  "#F8F6F1",
  100: "#F0EDE6",
  200: "#E2DDD2",
  300: "#C7BFAE",
  400: "#9F9686",
  500: "#75695B",
  600: "#564C42",
  700: "#3D352D",
  800: "#25201B",
  900: "#14110E",
};

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary,
        secondary,
        accent,
        gray: neutral,
        bg:        neutral[50],
        surface:   "#FFFFFF",
        raised:    neutral[100],
        line:      neutral[200],
        "line-h":  neutral[300],
        txt:       neutral[900],
        sub:       neutral[600],
        dim:       neutral[500],
        gold:      secondary[600],
        "gold-dim": secondary[50],
        "gold-bd":  secondary[200],
        growth:     primary[600],
        "growth-dim": primary[50],
        danger:     "#B91C1C",
        "danger-dim": "#FEF2F2",
      },
      fontFamily: {
        syne:    ["var(--font-syne)", "serif"],
        dm:      ["var(--font-dm)", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
        display: ["var(--font-syne)", "serif"],
        body:    ["var(--font-dm)", "sans-serif"],
        sans:    ["var(--font-dm)", "sans-serif"],
      },
      borderRadius: {
        "2": "2px",
        "4": "4px",
        "6": "6px",
      },
      boxShadow: {
        soft:     "0 1px 2px rgba(20, 17, 14, 0.04), 0 1px 1px rgba(20, 17, 14, 0.03)",
        elevated: "0 8px 24px -8px rgba(20, 17, 14, 0.08), 0 2px 4px rgba(20, 17, 14, 0.04)",
        floating: "0 16px 40px -16px rgba(20, 17, 14, 0.18), 0 4px 8px rgba(20, 17, 14, 0.04)",
        glow:     "0 0 0 4px rgba(31, 106, 64, 0.08)",
      },
      keyframes: {
        "count-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "count-in":   "count-in 0.4s ease-out forwards",
        shimmer:      "shimmer 2s linear infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
