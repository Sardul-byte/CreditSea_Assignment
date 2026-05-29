import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
        card: "0 4px 24px -4px rgba(15, 23, 42, 0.08), 0 8px 16px -8px rgba(79, 70, 229, 0.12)",
        glow: "0 0 40px -8px rgba(99, 102, 241, 0.35)",
        "inner-soft": "inset 0 1px 0 0 rgba(255, 255, 255, 0.06)",
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)",
        "gradient-mesh":
          "radial-gradient(at 40% 20%, rgba(99, 102, 241, 0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(129, 140, 248, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(67, 56, 202, 0.08) 0px, transparent 50%)",
        "gradient-shine":
          "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.12) 50%, transparent 75%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        shimmer: "shimmer 2s infinite linear",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
