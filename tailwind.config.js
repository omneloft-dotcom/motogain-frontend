/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Background system
        background: "var(--color-background)",

        // Card system
        card: {
          DEFAULT: "var(--color-card)",
          hover: "var(--color-card-hover)",
        },
        border: "var(--color-border)",

        // Primary/Action (use sparingly)
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
        },
        highlight: "var(--color-highlight)",

        // Text system
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },

        // Functional
        error: "var(--color-error)",
        warning: "var(--color-warning)",
        info: "var(--color-info)",
        success: "var(--color-success)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
        slideDown: "slideDown 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};
