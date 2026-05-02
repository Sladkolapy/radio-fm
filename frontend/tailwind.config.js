/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: '#101820',
        surface: '#1E293B',
        primary: {
          50: '#f0fdff',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#22d3ee',
          600: '#22d3ee',
          700: '#06b6d4',
          800: '#0891b2',
          900: '#0e7490',
        },
      },
      ringOffsetColor: {
        app: '#101820',
      },
    },
  },
  plugins: [],
}
