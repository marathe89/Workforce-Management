/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Dark "ink" surface scale — app background, sidebar, cards, borders.
        // Matches the Coforge Workforce Intelligence design (dark navy, not pure gray/black).
        ink: {
          950: '#070A12',
          900: '#0A0E1A',
          850: '#0D1220',
          800: '#111827',
          700: '#151B2C',
          600: '#1C2436',
          500: '#2A3348',
          400: '#3D4763',
        },
        // Primary brand blue used for active states, links, primary buttons.
        brand: {
          400: '#5B7CFF',
          500: '#3B5BFF',
          600: '#2F46CC',
        },
      },
    },
  },
  plugins: [],
};
