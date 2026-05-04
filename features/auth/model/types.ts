export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  /** refreshToken으로 세션 복구를 시도하는 중. 이 시간 동안 로그인/프로필 UI를 숨긴다. */
  isAuthLoading: boolean;
  login: (email: string, password: string, next?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}
