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
  const [isAuthLoading, setIsAuthLoading] = useState(false);
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

  // 클라이언트 세션 복구:
  // 1) user가 null + refreshToken 존재 → 페이지 새로고침 후 세션 복구
  // 2) user는 있지만 accessToken이 메모리에 없음 → 새 탭/새 창에서 열린 경우
  //    SSR 쿠키로 initialUser는 내려오지만 클라이언트 apiClient에 토큰이 없다.
  //    refreshToken으로 accessToken을 복구해야 클라이언트 API 호출이 가능하다.
  useEffect(() => {
    if (!tokenStore.getRefresh()) return;

    // accessToken이 이미 메모리에 있으면 복구 불필요
    if (tokenStore.getAccess()) return;

    setIsAuthLoading(true);

    import("../api/authApi")
      .then(({ getUser }) => getUser())
      .then((apiUser) => {
        if (!user) setUser({ id: apiUser.id, email: apiUser.email });
        // 클라이언트 refresh로 복구된 accessToken을 SSR 쿠키에도 동기화
        const newAccess = tokenStore.getAccess();
        if (newAccess) syncAuthCookieAction(newAccess).catch(() => {});
      })
      .catch(async () => {
        // refreshToken도 만료된 경우: localStorage를 비우고 만료된 ggosoon-auth 쿠키도 제거.
        // 쿠키를 남기면 이후 SSR이 매번 실패해 영구적으로 비로그인 상태로 보임.
        tokenStore.clear();
        await logoutAction().catch(() => {});
      })
      .finally(() => setIsAuthLoading(false));
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
