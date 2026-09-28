'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, AuthResponse } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('threatlink_token');
        const storedUser = localStorage.getItem('threatlink_user');

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              // ignore json parse error
            }
          }

          // Verify token with backend
          const meRes = await authService.getCurrentUser(storedToken);
          if (meRes.success && meRes.data && meRes.data.user) {
            setUser(meRes.data.user);
            localStorage.setItem('threatlink_user', JSON.stringify(meRes.data.user));
          } else if (meRes.data && (meRes.data as any).id) {
            const uData: User = meRes.data as any;
            setUser(uData);
            localStorage.setItem('threatlink_user', JSON.stringify(uData));
          } else {
            // Invalid token
            localStorage.removeItem('threatlink_token');
            localStorage.removeItem('threatlink_user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await authService.login(email, password);
    if (res.success && res.data && res.data.access_token && res.data.user) {
      const newToken = res.data.access_token;
      const newUser = res.data.user;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('threatlink_token', newToken);
      localStorage.setItem('threatlink_user', JSON.stringify(newUser));
    }
    return res;
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    return authService.register(name, email, password);
  };

  const logout = () => {
    localStorage.removeItem('threatlink_token');
    localStorage.removeItem('threatlink_user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const meRes = await authService.getCurrentUser(token);
      if (meRes.success && meRes.data) {
        const userData = meRes.data.user || (meRes.data as any);
        if (userData && userData.id) {
          setUser(userData);
          localStorage.setItem('threatlink_user', JSON.stringify(userData));
        }
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
