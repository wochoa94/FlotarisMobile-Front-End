// src/theme/index.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { themes, ThemeName } from './colors';
import { logos, LogoName } from './logos';

interface ThemeContextType {
  themeName: ThemeName;
  logoSource: any; // Can be either require() result or { uri: string }
  themeColors: Record<string, string>; // Direct access to theme colors for React Native
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme: ThemeName; // Theme is now passed as a required prop
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const themeName = initialTheme;
  
  // Get theme colors (fallback to default if theme not found)
  const currentTheme = themes[themeName] || themes.default;
  if (!themes[themeName]) {
    console.warn(`Theme "${themeName}" not found. Falling back to default.`);
  }
  
  // Get logo source (handle both local require() and remote URLs)
  const logoData = logos[themeName as LogoName] || logos.default;
  const logoSource = typeof logoData === 'string' && logoData.startsWith('http') 
    ? { uri: logoData } // Remote URL
    : logoData; // Local require() result

  const value = {
    themeName,
    logoSource,
    themeColors: currentTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}