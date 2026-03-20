/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        dark: {
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
        },
      },
      fontFamily: {
        sans: ['Syne', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}