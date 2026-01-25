import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "retro-cream": "#FFF8E7",
        "sky-blue": "#48c7e0",
        charcoal: "#2C2C2C",
        orange: "#FF8C42",
        grapefruit: "#FF6B6B",
        "forest-green": "#4A7C59",
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "cursive"],
      },
    },
  },
  plugins: [],
};

export default config;
