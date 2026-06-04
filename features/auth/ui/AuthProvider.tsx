"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { loginAction, logoutAction, syncAuthCookieAction } from "../lib/actions";
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
  /**
   * accessToken 메모리 부트스트랩/refresh 완료 전 — 프로필 등 클라이언트 API 호출 대기.
   *
   * 초기값은 서버·클라이언트가 동일하게 계산할 수 있는 값(initialUser)만 사용한다.
   * tokenStore.getRefresh()는 localStorage를 읽어 SSR에서는 항상 null이므로,
   * 초기화에 포함하면 hydration 불일치(서버=로그인 버튼, 클라=로딩 스피너)가 발생한다.
   * localStorage refreshToken만 있는 경우의 로딩 상태는 아래 부트스트랩 effect가 처리한다.
   */
  const [isAuthLoading, setIsAuthLoading] = useState(() => Boolean(initialUser));
  const router = useRouter();
  const logoutInProgress = useRef(false);
  // user state의 최신값을 이벤트 핸들러에서 읽기 위한 ref.
  // 클로저 안에 user를 캡처하면 stale 참조가 된다.
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // 서버가 내려준 initialUser가 바뀌면 클라이언트 상태에 반영
  // (예: 회원가입 완료 후 router.push → SSR이 유저를 인식해 initialUser가 갱신되는 경우)
  useEffect(() => {
    if (initialUser && !user) setUser(initialUser);
  // initialUser가 바뀔 때만 실행. user를 deps에 넣으면 logout 후 재설정 루프 발생
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser]);

  // 클라이언트 accessToken 부트스트랩 (메모리는 새로고침마다 비워짐)
  // 1) refreshToken 있음 → /auth/refresh 로 복구 (401 없이)
  // 2) SSR initialUser + httpOnly 쿠키 → 서버 액션으로 메모리에 올림
  useEffect(() => {
    if (tokenStore.getAccess()) {
      setIsAuthLoading(false);
      return;
    }

    const hasRefresh = Boolean(tokenStore.getRefresh());
    if (!hasRefresh && !initialUser) {
      setIsAuthLoading(false);
      return;
    }

    let cancelled = false;

    async function restoreSession() {
      setIsAuthLoading(true);
      try {
        if (hasRefresh) {
          const { ensureClientAccessToken } = await import("@/shared/lib/api/client");
          if (!(await ensureClientAccessToken())) throw new Error("refresh failed");
        } else if (initialUser) {
          const { bootstrapClientAccessTokenAction } = await import("../lib/actions");
          const cookieToken = await bootstrapClientAccessTokenAction();
          if (cancelled) return;
          if (cookieToken) tokenStore.setAccess(cookieToken);
        }

        if (!tokenStore.getAccess()) throw new Error("no access token");

        const { getUser } = await import("../api/authApi");
        const apiUser = await getUser();
        if (cancelled) return;

        setUser((prev) => prev ?? { id: apiUser.id, email: apiUser.email });
        const newAccess = tokenStore.getAccess();
        if (newAccess) await syncAuthCookieAction(newAccess).catch(() => {});
      } catch {
        if (cancelled) return;
        tokenStore.clear();
        setUser(null);
        await logoutAction().catch(() => {});
      } finally {
        if (!cancelled) setIsAuthLoading(false);
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, [initialUser]);

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
    router.replace("/login");
  }, [router]);

  // API 레이어에서 401 UNAUTHORIZED 이벤트를 받으면 강제 로그아웃.
  // user === null인 경우는 초기 세션 복구 실패이므로 .catch 블록이 처리 — 여기선 건너뜀.
  // 동시 다발 이벤트로 인한 중복 실행 방지를 위해 ref 플래그 사용.
  useEffect(() => {
    const handleUnauthorized = () => {
      if (!userRef.current) return;
      if (logoutInProgress.current) return;
      logoutInProgress.current = true;
      logout().finally(() => { logoutInProgress.current = false; });
    };
    window.addEventListener("ggosoon:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("ggosoon:unauthorized", handleUnauthorized);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: user !== null, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
