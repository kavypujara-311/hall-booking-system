/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        luxury: {
          black: '#09090b', // Zinc-950 (Vercel dark bg)
          dark: '#18181b',  // Zinc-900 
          card: '#27272a',  // Zinc-800
          blue: {
            DEFAULT: '#3B82F6',
            light: '#60A5FA',
            dark: '#1D4ED8',
            deep: '#1E40AF',
          },
          gold: {
            DEFAULT: '#D4AF37',
            light: '#F4C430',
            dark: '#AA6C39',
          },
          silver: {
            DEFAULT: '#e4e4e7', // Zinc-200
            light: '#fafafa',   // Zinc-50
            dark: '#a1a1aa',    // Zinc-400
          },
        }
      },
      fontFamily: {
        sans: ['Jost', 'Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        royal: ['Cinzel', 'serif'],
        classic: ['Cormorant Garamond', 'serif'],
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(to bottom, #09090b, #18181b, #09090b)',
        'blue-gradient': 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
        'gold-gradient': 'linear-gradient(135deg, #AA6C39 0%, #D4AF37 50%, #F4C430 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
