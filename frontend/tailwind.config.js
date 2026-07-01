/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#17181B',
        panel: '#202226',
        panel2: '#26282D',
        copper: '#E08A3E',
        copperlight: '#F2A85C',
        teal: '#4F9E92',
        off: '#F3F1EA',
        muted: '#9A9A93',
        line: '#34363B',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
