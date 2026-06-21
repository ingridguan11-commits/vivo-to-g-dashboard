/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vivo: {
          50: "#eef6ff",
          100: "#d9ecff",
          200: "#b8ddff",
          300: "#87c7ff",
          400: "#4ba8ff",
          500: "#1684f8",
          600: "#0066d6",
          700: "#0054b0",
          800: "#06498f",
          900: "#0b3d76"
        },
        ink: {
          950: "#142033",
          800: "#28364d",
          600: "#536179"
        }
      },
      boxShadow: {
        panel: "0 18px 45px rgba(18, 45, 78, 0.08)"
      }
    }
  },
  plugins: []
};
