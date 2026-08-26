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
          bg: '#FFFFFF',
          darkBg: '#0F172A',
          surfaceLight: '#FFFFFF',
          capsuleLight: '#F1F3F6',
          cardBorder: '#E2E8F0',
          hover: '#F1F5F9',
          cyan: '#00BCFF',
          cyanHover: '#0099D6',
          cyanGlow: 'rgba(0, 188, 255, 0.15)',
          cyanLight: '#38D4FF',
          accentDark: '#0080B3',
          emerald: '#10B981',
          amber: '#F59E0B',
          purple: '#A855F7',
          textDark: '#0F172A',
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
