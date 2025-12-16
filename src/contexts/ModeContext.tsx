import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppMode = 'quick' | 'expert';

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isExpertMode: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>('quick');

  return (
    <ModeContext.Provider value={{ mode, setMode, isExpertMode: mode === 'expert' }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
