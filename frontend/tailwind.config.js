/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#9ca3af',
            a: {
              color: '#818cf8',
              '&:hover': {
                color: '#6366f1',
              },
            },
          },
        },
      },
       animation: {
          slide: 'slide 1.2s ease-in-out infinite',
        },
        keyframes: {
          slide: {
            '0%': {
              transform: 'translateX(-100%)',
              width: '20%',
            },
            '50%': {
              width: '40%',
            },
            '100%': {
              transform: 'translateX(100vw)',
              width: '30%',
            },
          },
        },
    },
  },
  plugins: [],
}
