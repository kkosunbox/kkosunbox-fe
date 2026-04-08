"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { loginAction, logoutAction } from "../lib/actions";
import { tokenStore } from "@/shared/lib/api/token";
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

  // 서버가 내려준 initialUser가 바뀌면 클라이언트 상태에 반영
  // (예: 회원가입 완료 후 router.push → SSR이 유저를 인식해 initialUser가 갱신되는 경우)
  useEffect(() => {
    if (initialUser && !user) setUser(initialUser);
  // initialUser가 바뀔 때만 실행. user를 deps에 넣으면 logout 후 재설정 루프 발생
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser]);

  // 페이지 새로고침 후 세션 복구:
  // SSR에서 accessToken이 만료돼 initialUser가 null이어도
  // localStorage의 refreshToken이 유효하면 자동으로 갱신 후 유저 상태를 복구한다.
  // apiClient는 env.ts를 의존하므로 루트 레이아웃에서 정적 import하면 크래시.
  // useEffect(클라이언트 전용) 안에서 dynamic import로 지연 로드한다.
  useEffect(() => {
    if (user !== null) return;
    if (!tokenStore.getRefresh()) return;

    import("../api/authApi")
      .then(({ getUser }) => getUser())
      .then((apiUser) => setUser({ id: apiUser.id, email: apiUser.email }))
      .catch(() => tokenStore.clear());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string, next?: string) => {
      const result = await loginAction(email, password);
      if (result.error) return { error: result.error };

      if (result.accessToken && result.refreshToken) {
        tokenStore.setTokens(result.accessToken, result.refreshToken);
      }
      if (result.user) setUser(result.user);

      const safePath = next?.startsWith("/") ? next : "/";
      router.push(safePath);
      return {};
    },
    [router],
  );

  const logout = useCallback(async () => {
    await logoutAction();
    tokenStore.clear();
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
