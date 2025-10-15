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
        // Zen Garden Palette
        'zen-green': '#6E8B70',         // Muted, calming green for primary actions & focus states
        'zen-green-dark': '#556B58',   // Darker shade for hovers/active states
        'zen-sand': '#F0EAD6',          // Warm, light beige for backgrounds in light mode, and text in dark mode
        'zen-charcoal': '#36454F',      // Deep, soft charcoal for text in light mode, and UI elements in dark mode
        'zen-night': '#1C252E',        // A very dark blue-charcoal for the base dark mode background
        'zen-night-light': '#2A3A4A',  // A slightly lighter shade for elevated surfaces in dark mode (cards, modals)
        'zen-sky-light': '#A0C1D1',     // Pale blue for break timer/sky elements (light theme)
        'zen-sky-dark': '#7DA4B8',      // Darker sky blue for break timer/sky elements (dark theme)
        'zen-sun': '#FFB74D',           // Soft orange/yellow for accents, like the sun or highlights

        // Original Palette (kept for potential reference, can be removed)
        primary: '#4CAF50',
        'primary-dark': '#388E3C',
        'primary-light': '#C8E6C9',
        secondary: '#FFC107',
        'secondary-dark': '#FFA000',
        'secondary-light': '#FFECB3',
        accent: '#795548',
        'accent-dark': '#5D4037',
        'accent-light': '#D7CCC8',
        text: '#212121',
        'text-light': '#757575',
        background: '#F5F5F5',
        'background-dark': '#121212',
        danger: '#F44336',
        'danger-dark': '#D32F2F',
        'danger-light': '#FFCDD2',
      }
    },
  },
  plugins: [],
}
