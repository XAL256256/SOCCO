import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem", xl: "2.5rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#fef4ee",
          100: "#fde8dc",
          200: "#fbcbb9",
          300: "#f8a987",
          400: "#f47d53",
          500: "#ec5a2e",
          600: "#dd4124",
          700: "#b82f1d",
          800: "#94281c",
          900: "#79251c",
        },
        secondary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#16a34a",
          600: "#15803d",
          700: "#166534",
          800: "#14532d",
          900: "#052e16",
        },
        accent: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
        },
        // Warm grays (Tailwind stone palette)
        gray: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
          950: "#0c0a09",
        },
        success: "#16a34a",
        warning: "#eab308",
        danger: "#dc2626",
        info: "#0891b2",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.375rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.75rem", { lineHeight: "2.25rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "4xl": ["3rem", { lineHeight: "1.1" }],
        "5xl": ["4rem", { lineHeight: "1" }],
        "6xl": ["5rem", { lineHeight: "1" }],
        "7xl": ["6rem", { lineHeight: "1" }],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        blob: "60% 40% 30% 70% / 60% 30% 70% 40%",
      },
      boxShadow: {
        glow: "0 0 20px 0 rgba(236, 90, 46, 0.25)",
        "glow-lg": "0 0 40px 0 rgba(236, 90, 46, 0.35)",
        "glow-green": "0 0 20px 0 rgba(22, 163, 74, 0.25)",
        "glow-gold": "0 0 20px 0 rgba(234, 179, 8, 0.25)",
        soft:
          "0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 0 rgba(236,90,46,0.05)",
        elevated:
          "0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -1px rgba(236,90,46,0.06), 0 0 0 1px rgba(236,90,46,0.02)",
        floating:
          "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -2px rgba(236,90,46,0.05), 0 0 0 1px rgba(236,90,46,0.03), 0 0 20px 0 rgba(236,90,46,0.05)",
        epic:
          "0 20px 25px -5px rgba(0,0,0,0.10), 0 10px 10px -5px rgba(236,90,46,0.04), 0 0 0 1px rgba(236,90,46,0.03), 0 0 40px 0 rgba(236,90,46,0.08)",
      },
      keyframes: {
        morphing: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(40px, 20px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scan-line": {
          "0%, 100%": { top: "20%" },
          "50%": { top: "80%" },
        },
      },
      animation: {
        morphing: "morphing 8s ease-in-out infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "float-slow": "float-slow 20s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "scan-line": "scan-line 2s linear infinite",
      },
      backgroundImage: {
        "gradient-warm":
          "linear-gradient(135deg, #ec5a2e 0%, #f47d53 50%, #eab308 100%)",
        "gradient-savings":
          "linear-gradient(135deg, #16a34a 0%, #4ade80 100%)",
        "gradient-sunset":
          "linear-gradient(135deg, #ec5a2e 0%, #eab308 100%)",
        "noise":
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")",
      },
    },
  },
  plugins: [],
};

export default config;
