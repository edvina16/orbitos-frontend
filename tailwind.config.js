/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        onedark: {
          bg: '#282c34',
          bgAlt: '#21252b',
          border: '#3e4451',
          text: '#abb2bf',
          accent: '#61afef',
          accentHover: '#528bff',
          error: '#e06c75',
          warning: '#e5c07b',
          success: '#98c379',
          info: '#56b6c2',
        },
      },
    },
  },
  plugins: [],
}
