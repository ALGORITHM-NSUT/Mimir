import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Theme variables
  const themeColors = {
    dark: {
      background: '#1b1c1d',
      surface: '#2a2a2a',
      surfaceLight: '#303030',
      surfaceMedium: '#404040',
      text: 'text-gray-100',
      textMuted: 'text-gray-300',
      accent: 'cyan',
    },
    light: {
      background: '#f5f5f5',
      surface: '#ffffff',
      surfaceLight: '#f0f0f0',
      surfaceMedium: '#e5e5e5',
      text: 'text-gray-900',
      textMuted: 'text-gray-600',
      accent: 'cyan',
    }
  };

  const currentTheme = themeColors[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 