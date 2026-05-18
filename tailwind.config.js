/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: "#157f3c",
        "primary-dark": "#0f5c2b",
        "primary-light": "#1a9e4a",
        secondary: "#ead5b3",
        accent: "#52eba6",
        background: "#f3f4f6",
        foreground: "#111827",
      },
    },
  },
  plugins: [],
};