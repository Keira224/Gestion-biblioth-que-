/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-blue": "#2f5aff",
        "brand-deep": "#1a2b7b",
      },
    },
  },
  plugins: [],
};
