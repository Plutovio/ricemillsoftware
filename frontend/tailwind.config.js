/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f2f5',
          100: '#d9dfe8',
          200: '#b3bfd1',
          300: '#8d9fba',
          400: '#677fa3',
          500: '#415f8c',
          600: '#334b70',
          700: '#263854',
          800: '#1a2744',
          900: '#0d1422',
        },
        status: {
          expired: '#fef2f2',
          'expired-text': '#dc3545',
          'expired-border': '#fecaca',
          warning: '#fffbeb',
          'warning-text': '#f59e0b',
          'warning-border': '#fef3c7',
          active: '#f0fdf4',
          'active-text': '#22c55e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
