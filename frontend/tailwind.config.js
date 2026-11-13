/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Seed Sans Mono"', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        forest: {
          DEFAULT: '#1c3a13',
          depths: '#1c3a13',
          hover: '#284f1c',
          dark: '#142a0e',
        },
        lime: {
          DEFAULT: '#d3fa99',
          pulse: '#d3fa99',
          hover: '#c3ee83',
        },
        sage: {
          DEFAULT: '#757c5d',
          moss: '#757c5d',
        },
        olive: {
          DEFAULT: '#9f995b',
          gold: '#9f995b',
        },
        eucalyptus: {
          DEFAULT: '#698e79',
        },
        snow: {
          DEFAULT: '#fcfcf7',
          white: '#fcfcf7',
        },
        stone: {
          DEFAULT: '#eeeee9',
          warm: '#eeeee9',
        },
        frosted: {
          DEFAULT: '#c4c7c4',
          glass: '#c4c7c4',
        },
        ash: {
          DEFAULT: '#b3b3b3',
        },
        pewter: {
          DEFAULT: '#666666',
        },
        ink: {
          DEFAULT: '#000000',
        },
        // Compatibilidad con selectores previos mapeados al sistema Seed
        zafiro: {
          DEFAULT: '#1c3a13',
          hover: '#284f1c',
          light: '#eeeee9',
        },
        esmeralda: {
          DEFAULT: '#1c3a13',
          hover: '#284f1c',
          light: '#d3fa99',
        },
      },
      borderRadius: {
        'cards': '16px',
        'large-cards': '32px',
        'inputs': '8px',
        'full': '1000px',
      },
      boxShadow: {
        'none': 'none',
      },
      letterSpacing: {
        'tight-display': '-0.72px',
        'tight-heading': '-0.4px',
        'tight-subheading': '-0.48px',
        'tight-body': '-0.18px',
        'mono': '0.015em',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-check': {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '60%': { transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.22s ease-out forwards',
        'scale-check': 'scale-check 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};


