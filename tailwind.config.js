/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: '#1B2A4A',
        ink: '#14213D',
        muted: '#64748B',
        line: '#E2E8F0',
        sky: '#2E6F95',
        ok: '#16A34A',
        'ok-bg': '#DCFCE7',
        warn: '#D97706',
        'warn-bg': '#FEF3C7',
        bad: '#DC2626',
        'bad-bg': '#FEE2E2',
      },
    },
  },
  plugins: [],
};