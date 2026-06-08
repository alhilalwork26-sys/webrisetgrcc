/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#dce6ff',
          200: '#baccff',
          300: '#87aaff',
          400: '#547eff',
          500: '#2f55ff',
          600: '#1a35f5',
          700: '#1525e1',
          800: '#1720b6',
          900: '#191f8f',
          950: '#121363',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
