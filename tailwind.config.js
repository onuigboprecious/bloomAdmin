/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bloom: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          cardBorder: '#E2E8F0',
          hover: '#F1F5F9',
          cyan: '#0088CC',
          cyanGlow: 'rgba(0, 136, 204, 0.15)',
          cyanLight: '#00BCFF',
          accentDark: '#005580',
          emerald: '#059669',
          amber: '#D97706',
          purple: '#7C3AED',
          textMuted: '#64748B',
          textSubtle: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        none: 'none',
        sm: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        'cyan-glow': 'none',
        'cyan-sm': 'none',
        'glass': 'none',
      },
    },
  },
  plugins: [],
}
