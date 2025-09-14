import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-poppins)', 'system-ui', 'Arial', 'sans-serif'],
      },
      animation: {
        'background-shift': 'backgroundShift 20s ease infinite',
      },
      keyframes: {
        backgroundShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundColor: {
        active: 'active',
      },
      textColor: {
        active: 'active',
      },
    },
  },
  plugins: [],
};

export default config;