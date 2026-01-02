/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      spacing: {
        'card-sm': '0.75rem',
        'card-md': '1rem',
        'card-lg': '1.5rem',
        'card-xl': '2rem',
      },
    },
  },
  plugins: [],
};
