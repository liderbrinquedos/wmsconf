/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        bg: '#0f172a',
        surface: '#1e293b',
        'surface-light': '#334155',
        accent: '#e11d48',
        'accent-glow': 'rgba(225, 29, 72, 0.2)',
        text: {
          DEFAULT: '#f8fafc',
          muted: '#94a3b8',
        },
        success: '#22c55e',
        danger: '#ef4444',
      },
      spacing: {
        'nav-height': '70px',
      },
    },
  },
  plugins: [],
}