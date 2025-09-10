// client/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import ApiService from '../services/ApiService';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterFormData) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'client';
  company?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = ApiService.getToken();
        if (!token) {
          setLoading(false);
          setIsInitialized(true);
          return;
        }

        // Try to get current user
        const userData = await ApiService.getCurrentUser();
        setUser(userData as AuthUser);
      } catch (error: any) {
        console.error('Auth initialization failed:', error);
        
        // Clear invalid token
        ApiService.clearToken();
        setUser(null);
        
        // Don't set error for initialization failures to prevent UI errors
        // The user will just see the login screen
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApiService.login(email, password);
      
      if (response && response.user) {
        setUser(response.user as AuthUser);
        return true;
      }
      
      throw new Error('Invalid login response');
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApiService.register(userData);
      
      if (response && response.user) {
        setUser(response.user as AuthUser);
        return true;
      }
      
      throw new Error('Invalid registration response');
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle different types of errors
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        setError('An account with this email already exists.');
      } else if (error.message?.includes('validation') || error.message?.includes('invalid')) {
        setError('Please check your information and try again.');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Call logout endpoint (but don't fail if it doesn't work)
      try {
        await ApiService.logout();
      } catch (error) {
        console.warn('Server logout failed, but continuing with local logout:', error);
      }
      
      // Clear local state
      ApiService.clearToken();
      setUser(null);
      setError(null);
      
      // Redirect to login
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      ApiService.clearToken();
      setUser(null);
      window.location.href = '/auth';
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated: !!user && !!ApiService.getToken(),
  };

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};