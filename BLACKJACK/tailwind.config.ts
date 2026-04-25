import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          50: "rgba(255,255,255,0.03)",
          100: "rgba(255,255,255,0.06)",
          200: "rgba(255,255,255,0.08)",
          300: "rgba(255,255,255,0.12)",
          border: "rgba(255,255,255,0.08)",
          "border-strong": "rgba(255,255,255,0.15)",
        },
        neon: {
          cyan: "#00F5FF",
          pink: "#FF006E",
          purple: "#9D4EDD",
          gold: "#FFD700",
          green: "#00FF88",
          red: "#FF3333",
        },
        table: {
          felt: "#0a3d2e",
          dark: "#051a12",
        },
      },
      backdropBlur: {
        glass: "20px",
        "glass-strong": "40px",
      },
      animation: {
        "mesh-gradient": "mesh-gradient 12s ease infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "card-deal": "card-deal 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
      },
      keyframes: {
        "mesh-gradient": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(0,245,255,0.4)" },
          "100%": { boxShadow: "0 0 0 20px rgba(0,245,255,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "card-deal": {
          "0%": { transform: "translateY(-100px) rotateY(180deg) scale(0.5)", opacity: "0" },
          "100%": { transform: "translateY(0) rotateY(0deg) scale(1)", opacity: "1" },
        },
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(255,255,255,0.02)",
        "glass-strong":
          "0 8px 32px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)",
        "neon-cyan": "0 0 20px rgba(0,245,255,0.3), 0 0 60px rgba(0,245,255,0.1)",
        "neon-pink": "0 0 20px rgba(255,0,110,0.3), 0 0 60px rgba(255,0,110,0.1)",
        "neon-gold": "0 0 20px rgba(255,215,0,0.3), 0 0 60px rgba(255,215,0,0.1)",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
