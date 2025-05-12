import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

/**
 * Hook for handling authentication
 */
export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated from localStorage
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  /**
   * Login with password
   * @param password Password to authenticate with
   * @returns Promise resolving to success status
   */
  const login = async (password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await apiRequest('POST', '/api/auth/login', { password });
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Incorrect password. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = (): void => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}
