module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          background: 'var(--background)',
          surface: 'var(--surface)',
          surfaceLight: 'var(--surface-light)',
          surfaceMedium: 'var(--surface-medium)',
          text: 'var(--text)',
          textMuted: 'var(--text-muted)',
          accent: 'var(--accent)',
        }
      }
    }
  }
}; 