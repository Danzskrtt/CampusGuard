import React, { createContext, useContext, useMemo, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

export type ThemePalette = {
  background: string;
  text: string;
  inputBackground: string;
  button: string;
  buttonText: string;
  border: string;
  mutedText: string;
  secondaryText: string;
  headerTint: string;
};

const palettes: Record<ThemeMode, ThemePalette> = {
  dark: {
    background: '#1E2B45',
    text: '#FFFFFF',
    inputBackground: '#1E293B',
    button: '#FFFFFF',
    buttonText: '#1E2B45',
    border: '#475569',
    mutedText: '#CBD5E1',
    secondaryText: '#94A3B8',
    headerTint: '#FFFFFF',
  },
  light: {
    background: '#F8FAFC',
    text: '#0F172A',
    inputBackground: '#FFFFFF',
    button: '#1E2B45',
    buttonText: '#FFFFFF',
    border: '#CBD5E1',
    mutedText: '#334155',
    secondaryText: '#64748B',
    headerTint: '#0F172A',
  },
};

type ThemeContextValue = {
  theme: ThemeMode;
  colors: ThemePalette;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light');

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors: palettes[theme],
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }

  return context;
}
