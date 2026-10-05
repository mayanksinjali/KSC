import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand tokens resolve to CSS variables so light/dark switch cleanly.
        paper: "rgb(var(--paper) / <alpha-value>)",
        "paper-2": "rgb(var(--paper-2) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        teal: {
          DEFAULT: "rgb(var(--teal) / <alpha-value>)",
          soft: "rgb(var(--teal-soft) / <alpha-value>)",
        },
        forest: "rgb(var(--forest) / <alpha-value>)",
        amber: {
          DEFAULT: "rgb(var(--amber) / <alpha-value>)",
          soft: "rgb(var(--amber-soft) / <alpha-value>)",
        },
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        nepali: ["var(--font-nepali)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        soft: "0.625rem",
        card: "0.875rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(var(--ink) / 0.04), 0 8px 24px -12px rgb(var(--ink) / 0.12)",
        lift: "0 2px 6px rgb(var(--ink) / 0.06), 0 24px 48px -24px rgb(var(--ink) / 0.24)",
      },
      maxWidth: {
        content: "76rem",
        prose: "44rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        orbit: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        drift: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        orbit: "orbit 40s linear infinite",
        drift: "drift 7s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
