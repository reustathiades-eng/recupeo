import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B1426', dark: '#060D1B', light: '#0F2847' },
        emerald: { DEFAULT: '#00D68F', dark: '#00B377', light: '#4AE8C4' },
        slate: { text: '#1E293B', muted: '#64748B', border: '#E2E8F0', bg: '#F7F9FC' },
      },
      fontFamily: {
        heading: ['Bricolage Grotesque', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.7s ease forwards',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'pulse-dot': { '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,214,143,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(0,214,143,0)' } },
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
