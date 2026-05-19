import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#bbddfc',
          300: '#7fc1fa',
          400: '#3aa1f5',
          500: '#1086e6',
          600: '#0469c4',
          700: '#06549e',
          800: '#0a4783',
          900: '#0e3c6c',
          950: '#09254a'
        },
        ink: {
          DEFAULT: '#0b1d2e',
          soft: '#334155',
          muted: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06)'
      }
    }
  },
  plugins: []
};

export default config;
