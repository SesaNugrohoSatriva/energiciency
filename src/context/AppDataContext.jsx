import { createContext, useContext, useMemo, useState } from 'react';
import { buildMockData } from '../data/mockDatabase';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [data, setData] = useState(() => buildMockData());

  const value = useMemo(() => ({ data, setData }), [data]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }

  return context;
}
