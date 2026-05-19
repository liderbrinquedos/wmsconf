/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Helvetica Neue"', 'sans-serif'],
      },
      colors: {
        bg: '#f5f5f7',
        surface: '#ffffff',
        'surface-secondary': '#f2f2f5',
        border: '#e0e0e4',
        text: '#1d1d1f',
        'text-secondary': '#86868b',
        accent: '#0071e3',
        'accent-hover': '#0077ed',
        success: '#34c759',
        danger: '#ff3b30',
        warning: '#f59e0b',
        'status-conferido': '#34c759',
        'status-parcial': '#f59e0b',
        'status-falta': '#ff3b30',
        'status-excesso': '#ff3b30',
        'status-bloqueado': '#86868b',
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '8px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.06)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
      },
      minHeight: {
        touch: '48px',
      },
    },
  },
  plugins: [],
}