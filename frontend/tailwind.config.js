/** @type {import('tailwindcss').Config} */
const colors = require('./src/utils/styles/colors');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      screens: {
        xs: '420px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(42, 36, 33, 0.04), 0 8px 24px -12px rgba(42, 36, 33, 0.18)',
        lift: '0 2px 4px rgba(42, 36, 33, 0.05), 0 24px 48px -20px rgba(42, 36, 33, 0.35)',
      },
      borderRadius: {
        arch: '999px 999px 1.5rem 1.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
