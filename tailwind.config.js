/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#000000',
          0.25: 'rgba(0, 0, 0, 0.25)',
          0.2: 'rgba(0, 0, 0, 0.2)',
        },
        white: {
          DEFAULT: '#FFFFFF',
        },
        dark_grey: {
          DEFAULT: '#282626',
        },
        light_grey: {
          DEFAULT: '#E0E0E0',
        },
        brown: {
          DEFAULT: '#141212',
        },
        red: {
          DEFAULT: 'red',
        },
      },
      boxShadow: {
        button_shadow:
          '0px 4px 4px rgba(0, 0, 0, 0.25), inset 0px 4px 4px rgba(0, 0, 0, 0.2)',
        action_box: '0px 5px 10px rgba(44, 42, 42, 0.4)',
      },
    },
  },
  plugins: [],
};
