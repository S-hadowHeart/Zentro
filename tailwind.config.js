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
        'primary-dark': '#6AD3C3',
        'primary-light': '#E0F2F1',
        secondary: 'var(--secondary-color)',
        'secondary-dark': '#9AA6DA',
        'secondary-light': '#E8EAF6',
        accent: 'var(--accent-color)',
        'accent-dark': '#F0B951',
        'accent-light': '#FFF8E1',
        'text-color': 'var(--text-color)',
        'text-light': '#5a7388',
        'background-color': 'var(--background-color)',
        danger: 'var(--danger-color)',
        'danger-dark': '#c0392b',
        'danger-light': '#FADBD8',
      }
    },
  },
  plugins: [],
}