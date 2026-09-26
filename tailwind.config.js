/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,njk}", "./src/assets/js/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1a3fb8",
        "navy-brand": "#0f1f3d",
        "accent-teal": "#0f766e",
        "accent-cyan": "#0f766e",
        "bright-blue": "#2563eb",
        "warm-amber": "#d97706",
        "background-light": "#f8f9fc",
        "background-dark": "#0f172a",
        surface: "#ffffff",
        "surface-alt": "#f3f6fa",
        "border-light": "#e2e8f0",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        serif: ["Source Serif 4", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
};
