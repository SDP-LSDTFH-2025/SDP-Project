/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // include all JS/JSX/TSX files
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1d4ed8",
        "primary-foreground": "#ffffff",
        secondary: "#6b7280",
        "secondary-foreground": "#ffffff",
        destructive: "#dc2626",
      },
    },
  },
  plugins: [],
};
