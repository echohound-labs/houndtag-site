import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gunmetal / stamped-steel scale — cool, desaturated, machined.
        steel: {
          950: "#0b0d0e", // base — gunmetal black
          900: "#111417", // page panels
          850: "#161a1d",
          800: "#1c2226", // raised surface
          700: "#272e33", // engraving grooves / borders
          600: "#3a444a", // hairlines
          500: "#5b676e", // muted labels
          400: "#77848b",
          300: "#9aa6ac", // secondary text
          200: "#c2cbd0",
          100: "#dfe5e8", // primary text — brushed steel
        },
        // Single accent: terminal phosphor green, reserved for live/active state.
        phosphor: {
          DEFAULT: "#3ff08a",
          dim: "#2bbb6c",
          deep: "#188a4d",
        },
        // Amber only for "stale" — a warning, never decoration.
        rust: {
          DEFAULT: "#d8a24a",
          deep: "#8a6522",
        },
      },
      fontFamily: {
        display: ["var(--font-saira)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-plex-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        stamp: "0.18em",
      },
      boxShadow: {
        // Debossed inset: text/panels pressed into steel.
        engrave: "inset 0 1px 2px rgba(0,0,0,0.7), inset 0 -1px 0 rgba(255,255,255,0.04)",
        emboss: "0 1px 0 rgba(255,255,255,0.05), 0 2px 6px rgba(0,0,0,0.5)",
        tag: "0 20px 40px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
