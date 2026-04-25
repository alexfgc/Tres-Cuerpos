/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'space-black': '#000000',
        primary: '#ffffff',
        accent: '#4a90e2',
        highlight: '#ffd700',
        danger: '#ff4444',
        success: '#00ff88',
      },
      fontFamily: {
        display: ['Inter', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}

