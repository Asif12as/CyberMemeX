/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
      },
      colors: {
        cyber: {
          blue: '#00FFFF',
          pink: '#FF1493',
          green: '#39FF14',
          purple: '#8A2BE2',
          orange: '#FF6B35',
        },
        neon: {
          blue: '#00D4FF',
          pink: '#FF2D92',
          green: '#00FF41',
          purple: '#9D00FF',
          yellow: '#FFFF00',
        }
      },
      animation: {
        'glitch': 'glitch 2s infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite alternate',
        'scanline': 'scanline 2s linear infinite',
        'matrix': 'matrix 20s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'pulse-neon': {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' },
          '100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
        scanline: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)',
        'cyber-gradient': 'linear-gradient(45deg, #00FFFF, #FF1493, #39FF14, #8A2BE2)',
      },
      backgroundSize: {
        'grid': '20px 20px',
      }
    },
  },
  plugins: [],
}