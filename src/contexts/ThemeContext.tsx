import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('stegcrypt-theme') as Theme) || 'system';
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    
    const updateTheme = () => {
      let resolved: 'light' | 'dark';
      
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolved = theme;
      }
      
      setResolvedTheme(resolved);
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);

      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]');
      if (favicon) {
        const svg = resolved === 'dark'
          ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="#121212" stroke="#ffffff" stroke-width="2" stroke-opacity="0.25"/><g transform="translate(10, 10) scale(1.8333)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2.5"/><rect width="8" height="5" x="14" y="17" rx="1" fill="#121212"/><path d="M20 17v-2a2 2 0 1 0-4 0v2"/></g></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="#ffffff" stroke="#121212" stroke-width="2" stroke-opacity="0.25"/><g transform="translate(10, 10) scale(1.8333)" fill="none" stroke="#121212" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2.5"/><rect width="8" height="5" x="14" y="17" rx="1" fill="#ffffff"/><path d="M20 17v-2a2 2 0 1 0-4 0v2"/></g></svg>`;
        favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      }
    };

    updateTheme();
    localStorage.setItem('stegcrypt-theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);
    
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
