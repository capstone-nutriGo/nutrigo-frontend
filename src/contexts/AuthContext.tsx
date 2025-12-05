// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import type { AuthResponse, TokenData } from "../api/auth";

interface AuthContextType {
  isLoggedIn: boolean;
  tokenData: TokenData | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokenData, setTokenData] = useState<TokenData | null>(() => {
    const saved = localStorage.getItem("tokenData");
    return saved ? (JSON.parse(saved) as TokenData) : null;
  });

  const isLoggedIn = !!tokenData?.accessToken;

  const login = (auth: AuthResponse) => {
    const data = auth.data;
    setTokenData(data);
    localStorage.setItem("tokenData", JSON.stringify(data));
  };

  const logout = () => {
    setTokenData(null);
    localStorage.removeItem("tokenData");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, tokenData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
