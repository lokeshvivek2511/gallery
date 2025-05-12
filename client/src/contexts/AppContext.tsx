import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { Media } from '@shared/schema';

// Simple app context with just authentication for now
type AppContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
};

const defaultContext: AppContextType = {
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  selectedTab: 'all',
  setSelectedTab: () => {}
};

const AppContext = createContext<AppContextType>(defaultContext);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    // Check if user is already authenticated
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    selectedTab,
    setSelectedTab
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
