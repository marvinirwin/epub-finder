module.exports = {
  content: [
  "./src/**/*.{js,jsx,ts,tsx}",
   './public/index.html',
   'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
