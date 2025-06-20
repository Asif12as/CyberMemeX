import React, { createContext, useContext } from 'react';
import { useMemes as useSupabaseMemes } from '../hooks/useMemes';

const MemeContext = createContext<ReturnType<typeof useSupabaseMemes> | undefined>(undefined);

export const MemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const memes = useSupabaseMemes();

  return (
    <MemeContext.Provider value={memes}>
      {children}
    </MemeContext.Provider>
  );
};

export const useMemes = () => {
  const context = useContext(MemeContext);
  if (context === undefined) {
    throw new Error('useMemes must be used within a MemeProvider');
  }
  return context;
};