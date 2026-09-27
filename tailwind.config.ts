import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e6fffb",
          100: "#c2fff5",
          400: "#22d3ee",
          500: "#00e5d0",
          600: "#00c4b3",
          700: "#009e91",
        },
      },
      boxShadow: {
        card: "0 4px 20px -8px rgba(0,0,0,0.4)",
        glow: "0 0 24px -4px rgba(0, 242, 254, 0.5)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },

  plugins: [],
};

export default config;