import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd2ff",
          300: "#8eb4ff",
          400: "#598bff",
          500: "#3563f2",
          600: "#2147d6",
          700: "#1c39ad",
          800: "#1c3289",
          900: "#1c2f6e",
        },
      },
      fontFamily: {
        sans: ["var(--font-system)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
