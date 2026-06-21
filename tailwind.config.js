/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Internal token name kept as `savr` — values are PickyBites brand colors
        savr: {
          50: "#FAFAFA",
          100: "#F5F0F1",
          200: "#E8E0E2",
          300: "#CFC5C8",
          400: "#A89598",
          500: "#C96B75",
          600: "#B85A64",
          650: "#4A4450",
          700: "#A85560",
          800: "#3D3540",
          875: "#252030",
          900: "#1E2330",
          925: "#181C28",
          950: "#0F1219",
        },
      },
    },
  },
  plugins: [],
};
