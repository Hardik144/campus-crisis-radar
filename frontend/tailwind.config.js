/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        radar: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#222222',
          muted: '#333333',
          text: '#e8e8e8',
          dim: '#888888',
          red: '#e53e3e',
          'red-dark': '#9b2c2c',
          'red-bright': '#fc4444',
          amber: '#d97706',
          green: '#16a34a',
          blue: '#2563eb',
        },
      },
      keyframes: {
        pulse_ring: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        slide_in: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fade_up: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        pulse_ring: 'pulse_ring 1.4s ease-out infinite',
        blink: 'blink 1.2s ease-in-out infinite',
        slide_in: 'slide_in 0.3s ease forwards',
        fade_up: 'fade_up 0.4s ease forwards',
      },
    },
  },
  plugins: [],
}
