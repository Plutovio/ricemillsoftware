import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/authApi';
import type { LoginRequest, RegisterRequest } from '../api/authApi';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem('auth_token')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token;

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      const { token: authToken, user: authUser } = response.data;
      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; detail?: string } } };
      const message = axiosErr.response?.data?.error || axiosErr.response?.data?.detail || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      const { token: authToken, user: authUser } = response.data;
      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { username?: string[]; password_confirm?: string[]; detail?: string } } };
      const message = axiosErr.response?.data?.username?.[0] || 
                      axiosErr.response?.data?.password_confirm?.[0] ||
                      axiosErr.response?.data?.detail || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated, isLoading,
      login, register, logout, error, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
