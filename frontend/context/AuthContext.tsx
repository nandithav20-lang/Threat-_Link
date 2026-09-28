'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, AuthResponse } from '@/services/authService';
import { createClient } from '@/utils/supabase/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Fetch initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const u = session.user;
          const formattedUser: User = {
            id: u.id,
            name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Investigator',
            email: u.email || '',
            role: u.user_metadata?.role || 'INVESTIGATOR',
            created_at: u.created_at,
          };
          setUser(formattedUser);
          setToken(session.access_token);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Failed to get Supabase session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen to Auth Changes (Google Login, Sign Out, Session Token Refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          const u = session.user;
          const formattedUser: User = {
            id: u.id,
            name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Investigator',
            email: u.email || '',
            role: u.user_metadata?.role || 'INVESTIGATOR',
            created_at: u.created_at,
          };
          setUser(formattedUser);
          setToken(session.access_token);
        } else {
          setUser(null);
          setToken(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await authService.login(email, password);
    if (res.success && res.data && res.data.access_token && res.data.user) {
      setToken(res.data.access_token);
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    return authService.register(name, email, password);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    const res = await authService.getCurrentUser();
    if (res.success && res.data?.user) {
      setUser(res.data.user);
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
