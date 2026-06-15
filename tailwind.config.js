/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        savr: {
          50: "#FAFAF8",
          100: "#F5F0EB",
          200: "#E8DFD6",
          300: "#D4C4B5",
          400: "#B8956F",
          500: "#C4785A",
          600: "#A85D3F",
          700: "#8B4A32",
          800: "#6D3A28",
          900: "#4A2819",
          950: "#1A1210",
        },
      },
    },
  },
  plugins: [],
};
