/** @type {import('tailwindcss').Config} */

import {nextui} from "@nextui-org/react";

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
      extend: {
        fontFamily: {
          sans: ['var(--font-inter)'],
          mono: ['var(--font-roboto-mono)'],
        },
      },
  },
  darkMode: "class",
  plugins: [nextui(), 
            require('@tailwindcss/typography')]
}
