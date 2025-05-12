import { createContext, useContext } from 'react';

interface AuthContextType {
  authenticated: boolean;
  setAuthenticated: (authenticated: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = AuthContext.Provider;

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const checkPassword = (password: string): boolean => {
  // Simple password check
  return password === 'lokiroja';
};
