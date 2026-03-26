/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#020617",
        skyline: "#0f172a",
        accent: "#22c55e",
        glow: "#38bdf8",
      },
      boxShadow: {
        panel: "0 24px 80px rgba(15, 23, 42, 0.35)",
      },
      backgroundImage: {
        city:
          "radial-gradient(circle at top, rgba(56, 189, 248, 0.16), transparent 38%), linear-gradient(180deg, rgba(15,23,42,1) 0%, rgba(2,6,23,1) 100%)",
      },
    },
  },
  plugins: [],
};
