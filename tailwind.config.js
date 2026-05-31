/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: '#0B0B0D',
          900: '#131316',
          800: '#1A1A1F',
          700: '#26262D',
          600: '#34343D',
        },
        road: {
          DEFAULT: '#FFD21E',
          600: '#F2C200',
          400: '#FFDE5C',
        },
        signal: '#FF5A1F',
        volt: '#22E0A1',
        concrete: {
          400: '#8A8B93',
          300: '#A9AAB2',
          200: '#C9CAD1',
        },
        line: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['"Archivo Variable"', 'Archivo', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '3px',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
}
