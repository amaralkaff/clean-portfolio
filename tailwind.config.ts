import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#304D63', // Original color
        'light-blue': '#B2E7E8', // Original color
        'teal': '#8FB9AA', // Original color
        'light-yellow': '#F2D096', // Original color
        'salmon': '#ED8975', // Original color
        'soft-dark-blue': '#50788F', // Lightened version
        'soft-light-blue': '#D1F0F1', // Lightened version
        'soft-teal': '#B1D1C5', // Lightened version
        'soft-light-yellow': '#F7E2C2', // Lightened version
        'soft-salmon': '#F2B4A2' // Lightened version
      }
    },
  },
  plugins: [],
};
export default config;
