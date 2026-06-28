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
        bg: {
          base: "#0f1117",
          surface: "#161b22",
          elevated: "#1c2333",
          border: "#2d333b",
        },
        accent: {
          DEFAULT: "#6e40c9",
          hover: "#7d4fd4",
          muted: "#6e40c920",
        },
        text: {
          primary: "#e6edf3",
          secondary: "#8b949e",
          muted: "#484f58",
        },
        status: {
          ongoing: "#3fb950",
          completed: "#58a6ff",
          hiatus: "#d29922",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
