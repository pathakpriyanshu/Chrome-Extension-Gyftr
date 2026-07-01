/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,html}'],
  // Prefix prevents Tailwind classes from colliding with host page styles
  prefix: 'gyftr-',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF6B35',
          secondary: '#1A1A2E',
          accent: '#F7C59F',
        },
      },
    },
  },
  plugins: [],
}
