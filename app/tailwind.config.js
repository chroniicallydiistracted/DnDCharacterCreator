/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment:   '#F4E4C1',
        'aged-paper':'#E8D5A3',
        'dark-ink':  '#1A0A00',
        crimson:     '#6B0E1A',
        'crimson-light': '#9B2232',
        gold:        '#C9A847',
        'gold-dark': '#9A7C2E',
        stone:       '#4A4540',
        leather:     '#5C3317',
        'leather-light': '#7A4A28',
        shadow:      '#0D0600',
        'page-bg':   '#2A1F14',
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body:    ['"EB Garamond"', 'Georgia', 'serif'],
        mono:    ['"Courier New"', 'monospace'],
      },
      fontSize: {
        'display-xl': ['2.5rem', { lineHeight: '1.1', letterSpacing: '0.05em' }],
        'display-lg': ['2rem',   { lineHeight: '1.2', letterSpacing: '0.04em' }],
        'display-md': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0.03em' }],
        'display-sm': ['1.25rem',{ lineHeight: '1.3', letterSpacing: '0.02em' }],
      },
      boxShadow: {
        'parchment': 'inset 0 2px 8px rgba(26,10,0,0.15), 0 2px 4px rgba(26,10,0,0.2)',
        'card':      '0 4px 16px rgba(13,6,0,0.4), inset 0 1px 0 rgba(201,168,71,0.3)',
        'card-hover':'0 6px 24px rgba(13,6,0,0.5), inset 0 1px 0 rgba(201,168,71,0.5)',
        'inset-gold':'inset 0 0 0 1px rgba(201,168,71,0.6)',
      },
      backgroundImage: {
        'parchment-texture': `
          radial-gradient(ellipse at 20% 50%, rgba(201,168,71,0.03) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(92,51,23,0.04) 0%, transparent 40%),
          linear-gradient(180deg, #F4E4C1 0%, #EDD9A3 50%, #F4E4C1 100%)
        `,
        'page-texture': `
          radial-gradient(ellipse at 10% 30%, rgba(92,51,23,0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 90% 70%, rgba(13,6,0,0.15) 0%, transparent 50%),
          linear-gradient(135deg, #2A1F14 0%, #1E1509 50%, #2A1F14 100%)
        `,
      },
      borderWidth: { 3: '3px' },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%,100%': { opacity: '0.6' },
          '50%':     { opacity: '1' },
        },
      },
      animation: {
        'fade-in':  'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.25s ease-out',
        shimmer:    'shimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
