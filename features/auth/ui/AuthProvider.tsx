"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { loginAction, logoutAction } from "../lib/actions";
import type { AuthContextValue, AuthUser } from "../model/types";

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  /** 서버에서 쿠키를 읽어 초기값으로 전달 (hydration flash 방지) */
  initialUser: AuthUser | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const router = useRouter();

  const login = useCallback(async (id: string, password: string, next?: string) => {
    const result = await loginAction(id, password);
    if (!result.error) {
      // 실제 인증으로 교체 시: API 응답의 유저 정보를 넣는다
      setUser({ id, name: "관리자" });
      // Open Redirect 방지: 외부 URL은 무시하고 홈으로
      const safePath = next?.startsWith("/") ? next : "/";
      router.push(safePath);
    }
    return result;
  }, [router]);

  const logout = useCallback(async () => {
    await logoutAction();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
