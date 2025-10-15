/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50', // A more vibrant green for primary actions
        'primary-dark': '#388E3C',
        'primary-light': '#C8E6C9',
        secondary: '#FFC107', // A warm, inviting amber for secondary elements
        'secondary-dark': '#FFA000',
        'secondary-light': '#FFECB3',
        accent: '#795548', // A rich brown for accents, adding to the earthy feel
        'accent-dark': '#5D4037',
        'accent-light': '#D7CCC8',
        text: '#212121', // Darker text for better readability
        'text-light': '#757575',
        background: '#F5F5F5', // A slightly off-white background for a softer look
        'background-dark': '#121212',
        danger: '#F44336',
        'danger-dark': '#D32F2F',
        'danger-light': '#FFCDD2',
      }
    },
  },
  plugins: [],
}