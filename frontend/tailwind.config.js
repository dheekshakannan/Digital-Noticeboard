/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable toggling dark mode using class="dark"
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#80a0ff',
          500: '#4d73ff', // Deep vibrant blue
          600: '#2e4eff',
          700: '#1a32e0',
          800: '#1321b3',
          900: '#111e8f',
          950: '#080d4f',
        },
        slate: {
          950: '#090d16', // Sleeker black-blue for dark mode backgrounds
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
