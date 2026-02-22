/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        'brand':    '0 4px 16px rgba(79,70,229,0.18)',
        'brand-lg': '0 20px 50px rgba(79,70,229,0.25)',
        'glow':     '0 0 30px rgba(79,70,229,0.35)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 55%, #9333EA 100%)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-out': 'fadeOut 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-left': 'slideLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-right': 'slideRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-up': 'scaleUp 0.5s ease-out',
        'bounce-light': 'bounceLight 2s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { 
          '0%': { opacity: '0' }, 
          '100%': { opacity: '1' } 
        },
        fadeOut: { 
          '0%': { opacity: '1' }, 
          '100%': { opacity: '0' } 
        },
        slideUp: { 
          '0%': { transform: 'translateY(20px)', opacity: '0' }, 
          '100%': { transform: 'translateY(0)', opacity: '1' } 
        },
        slideDown: { 
          '0%': { transform: 'translateY(-20px)', opacity: '0' }, 
          '100%': { transform: 'translateY(0)', opacity: '1' } 
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: { 
          '0%': { transform: 'scale(0.95)', opacity: '0' }, 
          '100%': { transform: 'scale(1)', opacity: '1' } 
        },
        scaleUp: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceLight: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(249, 115, 22, 0.6)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(249, 115, 22, 0.7)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 10px rgba(249, 115, 22, 0)' },
        },
      },
    },
  },
  plugins: [],
};
