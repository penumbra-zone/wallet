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
          0.1: 'rgba(0, 0, 0, 0.1)',
          0.7: 'rgba(0, 0, 0, 0.7)',
        },
        white: {
          DEFAULT: '#FFFFFF',
          0.3: 'rgba(255, 255, 255, 0.3)',
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
          DEFAULT: '#870606',
        },
        light_brown: {
          DEFAULT: '#524B4B',
        },
        green: {
          DEFAULT: '#368E00',
        },
        toogle_from: {
          DEFAULT: 'rgba(139, 228, 217, 0.6)',
        },
        toogle_via: {
          DEFAULT: 'rgba(200, 184, 128, 0.6)',
        },
        toogle_to: {
          DEFAULT: 'rgba(255, 144, 47, 0.5)',
        },
      },
      boxShadow: {
        button_shadow:
          '0px 4px 4px rgba(0, 0, 0, 0.25), inset 0px 4px 4px rgba(0, 0, 0, 0.2)',
        action_box: '0px 5px 10px rgba(44, 42, 42, 0.4)',
      },
    },
    screens: {
      ext: '0px',
      tablet: '680px',
      laptop: '1280px',
    },
  },

  plugins: [],
};
