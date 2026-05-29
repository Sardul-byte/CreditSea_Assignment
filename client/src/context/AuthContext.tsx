"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  decodeToken,
  getToken,
  isLoggedIn,
  removeToken,
  saveToken,
} from "@/lib/auth";

export interface AuthUser {
  id: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token && isLoggedIn()) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({ id: decoded.id, role: decoded.role });
      } else {
        removeToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string) => {
    saveToken(token);
    const decoded = decodeToken(token);
    if (decoded) {
      setUser({ id: decoded.id, role: decoded.role });
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, isLoading }),
    [user, login, logout, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
