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
    },
  },
  plugins: [
    
  ],
}