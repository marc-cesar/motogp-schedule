/** @type {import('tailwindcss').Config} */
export default {
  content: [    './src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}',
  './components/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}

