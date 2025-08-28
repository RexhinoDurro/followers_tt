// client/src/context/AuthContext.tsx - Updated with Fixed Types
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser } from '../types';
import ApiService from '../services/ApiService';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  loading: true,
  error: null,
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to process user data and add computed name field
  const processUserData = (userData: any): AuthUser => {
    const processedUser = {
      ...userData,
      name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email
    };
    return processedUser;
  };

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await ApiService.getCurrentUser();
          const processedUser = processUserData(userData);
          setUser(processedUser);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Clear invalid token
          ApiService.clearToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.login(email, password);
      const processedUser = processUserData(response.user);
      setUser(processedUser);
      
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    company?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.register(userData);
      const processedUser = processUserData(response.user);
      setUser(processedUser);
      
      return true;
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};