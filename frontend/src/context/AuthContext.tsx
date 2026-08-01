import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, TOKEN_STORAGE_KEY, getApiErrorMessage } from "../lib/api";
import type { AuthUser, CurrentUserProfile } from "../types";

interface AuthContextValue {
  user: CurrentUserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  applyToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshUser() {
    const res = await api.get<CurrentUserProfile>("/auth/me");
    setUser(res.data);
  }

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    refreshUser()
      .catch(() => localStorage.removeItem(TOKEN_STORAGE_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  async function applyToken(token: string) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    await refreshUser();
  }

  async function login(email: string, password: string) {
    try {
      const res = await api.post<{ token: string; user: AuthUser }>("/auth/login", {
        email,
        password,
      });
      await applyToken(res.data.token);
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Échec de la connexion."));
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser, applyToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return ctx;
}
