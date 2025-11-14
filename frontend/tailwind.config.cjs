/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}",
    ],
    theme: {
      extend: {
        colors: {
          'brand-0': '#ffffff',
          'brand-50': '#F1E7FE',
          'brand-100': '#D9BBFC',
          'brand-200': '#C18FFA',
          'brand-300': '#A863F8',
          'brand-400': '#9037F6',
          'brand-500': '#780BF4',
          'brand-600': '#5708B3',
          'brand-700': '#4D079C',
          'brand-800': '#370570',
          'brand-900': '#220344',
        },
        fontFamily: {
          sans: ['Poppins', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };
  