import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "selector",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      display: ["Cinzel Variable", ...defaultTheme.fontFamily.serif],
      body: ["Lora Variable", ...defaultTheme.fontFamily.serif],
    },
  },
  plugins: [],
};
