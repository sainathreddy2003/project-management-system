/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#C2410C', // deep burnt amber / rust
          hover: '#9A3412',
          subtle: '#FFF7ED',
          border: '#FDBA74',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8F8F6',
          header: '#F4F3EE',
          border: '#E4E4E7',
        },
        graphite: {
          900: '#18181B',
          700: '#3F3F46',
          500: '#71717A',
          400: '#A1A1AA',
          200: '#E4E4E7',
          100: '#F4F4F5',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
