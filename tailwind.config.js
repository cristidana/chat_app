/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.html', './src/**/*.js'], // Setează fișierele sursă pentru Tailwind CSS
  theme: {
    extend: {
      colors: {
        black: '#000',
        white: '#fff',
        // Adaugă alte culori personalizate dorite
      },
    },
  },
  variants: {},
  plugins: [],
}

