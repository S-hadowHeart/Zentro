/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zen-green': '#4A7C59',
        'zen-beige': '#F5F5DC',
        'zen-gray': '#E5E7EB',
        'zen-sky': '#B8D8D8'
      }
    },
  },
  plugins: [],
} 