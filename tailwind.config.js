/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF7',
          100: '#FAF7EE',
          200: '#F4EFE0',
          300: '#EAE1CB',
        },
        lavender: {
          50: '#F6F3FB',
          100: '#EEE7F8',
          200: '#DFD1F1',
          300: '#CBB4E8',
          400: '#B290DC',
          500: '#996DCF',
          600: '#7F4EB9',
          700: '#673A9A',
          800: '#522E7C',
          900: '#432665',
        },
        mint: {
          50: '#F0FDF8',
          100: '#DCFCEE',
          200: '#BBF7DC',
          300: '#86EFC2',
          400: '#4AE1A4',
          500: '#22C582',
          600: '#15A36A',
          700: '#138155',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(103, 58, 154, 0.06), 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        card: '0 4px 20px -2px rgba(103, 58, 154, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        floating: '0 10px 30px -5px rgba(103, 58, 154, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
