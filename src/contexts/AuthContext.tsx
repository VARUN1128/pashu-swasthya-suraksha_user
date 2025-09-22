'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { mockClient } from '@/lib/mockClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (contact: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id' | 'createdAt' | 'verified' | 'email'>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('auth-token');
    if (token) {
      mockClient.auth.getCurrentUser(token)
        .then(user => {
          if (user) {
            setUser(user);
          } else {
            localStorage.removeItem('auth-token');
          }
        })
        .catch(() => {
          localStorage.removeItem('auth-token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (contact: string, password: string) => {
    console.log('AuthContext login called with:', { contact });
    setLoading(true);
    try {
      const { user, token } = await mockClient.auth.login(contact, password);
      console.log('Login successful:', { user, token });
      setUser(user);
      localStorage.setItem('auth-token', token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'createdAt' | 'verified' | 'email'>) => {
    setLoading(true);
    try {
      const { user, token } = await mockClient.auth.signup(userData);
      setUser(user);
      localStorage.setItem('auth-token', token);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth-token');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
