import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

/**
 * Official Disaster Relief Portal Theme Tokens
 * Built for high-clarity, dignified emergency coordination (National Disaster Response / Red Cross style).
 */
export const THEMES = {
  SLATE_DARK: {
    id: 'SLATE_DARK',
    name: 'Official Disaster Dark Theme',
    colors: {
      // Core Layout
      bg: '#0f172a',             // slate-900: Main page background
      bgSecondary: '#020617',    // slate-950: Footer / Modal / Input background
      card: '#1e293b',           // slate-800: Cards and container shells
      cardHover: '#334155',      // slate-700: Card hover / elevated state
      
      // Borders & Dividers
      border: '#334155',         // slate-700: Main borders
      borderMuted: '#1e293b',    // slate-800: Subtle dividers
      
      // Typography
      textPrimary: '#f8fafc',    // slate-50: High-contrast headings
      textSecondary: '#cbd5e1',  // slate-300: Body text
      textMuted: '#64748b',      // slate-500: Subtitles and metadata
      
      // Standardized Action & Filter Buttons
      buttonActiveBg: '#334155', // slate-700: Unified active filter/tab background
      buttonActiveText: '#ffffff',
      buttonActiveBorder: '#64748b',
      
      buttonInactiveBg: '#020617', // slate-950/80: Unselected filter/tab background
      buttonInactiveText: '#94a3b8', // slate-400
      buttonInactiveBorder: '#1e293b', // slate-800
      
      // Emergency Actions (High Priority Only)
      sosRed: '#dc2626',         // red-600: Request Rescue / SOS buttons only
      sosRedHover: '#b91c1c',    // red-700
      
      // Official Accent
      accentAmber: '#f59e0b',    // amber-500: + REGISTER NGO / Helplines
      accentBlue: '#2563eb',     // blue-600: + OFFER BOAT / CAR
    },
    shadows: {
      card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      elevated: '0 10px 30px -5px rgba(0, 0, 0, 0.8)',
    },
  },
};

const ThemeContext = createContext({
  theme: THEMES.SLATE_DARK,
  themeId: 'SLATE_DARK',
  setThemeId: () => {},
});

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    try {
      return localStorage.getItem('flood_portal_theme') || 'SLATE_DARK';
    } catch {
      return 'SLATE_DARK';
    }
  });

  const theme = THEMES[themeId] || THEMES.SLATE_DARK;

  // Apply CSS root variables for web compatibility
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.style.setProperty('--color-bg', theme.colors.bg);
      root.style.setProperty('--color-card', theme.colors.card);
      root.style.setProperty('--color-border', theme.colors.border);
      root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
      root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
      localStorage.setItem('flood_portal_theme', themeId);
    } catch {
      // Ignore storage errors in restricted iframes
    }
  }, [theme, themeId]);

  const value = useMemo(() => ({
    theme,
    themeId,
    setThemeId,
  }), [theme, themeId]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom Hook for React Web and Native-style Theme access
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
