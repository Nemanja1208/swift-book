import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest } from '@/types';
import { OperationResult, isSuccessResult } from '@/types/api';
import * as authService from '@/services/auth.service';
import { isAuthenticated, clearTokens } from '@/services/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (request: LoginRequest) => Promise<OperationResult<User>>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);

    if (isAuthenticated()) {
      try {
        const result = await authService.getCurrentUser();
        if (isSuccessResult(result)) {
          setUser(result.data);
        } else {
          // Token invalid, clear it
          setUser(null);
          clearTokens();
        }
      } catch {
        setUser(null);
        clearTokens();
      }
    } else {
      setUser(null);
    }

    setIsLoading(false);
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const login = async (request: LoginRequest): Promise<OperationResult<User>> => {
    setIsLoading(true);
    try {
      const result = await authService.login(request);
      if (isSuccessResult(result)) {
        setUser(result.data.user);
        return {
          isSuccess: true,
          data: result.data.user,
          error: null,
          validationErrors: [],
          statusCode: 200,
        };
      }
      return {
        isSuccess: false,
        data: null,
        error: result.error,
        validationErrors: result.validationErrors,
        statusCode: result.statusCode,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
