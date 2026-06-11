/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#546380",
        secondary: "#ADBED9",
        background: "#EDF2FB",
        neutral: "#C5C7C6",
        text: "#1E293B",
        white: "#FFFFFF",
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(84, 99, 128, 0.1)',
        'premium-hover': '0 20px 40px -15px rgba(84, 99, 128, 0.2)',
        'glass': '0 8px 32px 0 rgba(84, 99, 128, 0.08)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
