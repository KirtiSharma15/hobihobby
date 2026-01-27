import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { LightColors, DarkColors } from '../constants/designSystem';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  colors: typeof LightColors;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const systemColorScheme = useColorScheme();

  // Determine if we should use dark mode
  const isDark = 
    theme === 'dark' || 
    (theme === 'system' && systemColorScheme === 'dark');

  // Get the appropriate colors based on the current theme
  const colors = isDark ? DarkColors : LightColors;

  // Update theme when system color scheme changes
  useEffect(() => {
    if (theme === 'system') {
      // Force re-render when system theme changes
      // The colors will automatically update based on isDark
    }
  }, [systemColorScheme, theme]);

  const value: ThemeContextType = {
    theme,
    colors,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;



