/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        accent: 'var(--accent-color)',
        'text-color': 'var(--text-color)',
        'background-color': 'var(--background-color)',
        danger: 'var(--danger-color)',
      }
    },
  },
  plugins: [],
} 