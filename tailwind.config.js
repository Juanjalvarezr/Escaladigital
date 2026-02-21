/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'electric-blue': '#0080FF',
        'violet': '#8B5CF6',
        'dark-bg': '#0F0F23',
        'dark-secondary': '#1A1A2E',
        'dark-tertiary': '#252542',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
