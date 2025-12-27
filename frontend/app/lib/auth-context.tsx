'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import { authAPI, getToken, removeToken } from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const refreshUser = async () => {
    const { data, error } = await authAPI.getUser();
    if (data) {
      setUser(data);
    } else {
      // Token invalid, clear it
      if (error) {
        removeToken();
        setUser(null);
      }
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await authAPI.login(email, password);

    if (error) {
      return { success: false, error };
    }

    if (data?.access_token) {
      await refreshUser();
      return { success: true };
    }

    return { success: false, error: 'Login failed' };
  };

  const logout = () => {
    setUser(null);
    authAPI.logout();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || user?.role === 'admin' || false,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected Route wrapper component
export function RequireAuth({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
    if (!isLoading && adminOnly && !isAdmin) {
      window.location.href = '/dashboard';
    }
  }, [isLoading, isAuthenticated, isAdmin, adminOnly]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (adminOnly && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
