/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(0,0,0,1)',
        'brutal-dark': '4px 4px 0px 0px rgba(255,255,255,1)',
        'brutal-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'brutal-sm-dark': '2px 2px 0px 0px rgba(255,255,255,1)',
        'brutal-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
        'brutal-lg-dark': '6px 6px 0px 0px rgba(255,255,255,1)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
        blink: 'blink 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
