export interface AuthUser {
  id: number;
  email: string;
  phone: string | null;
  isInfluencer: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  /** refreshToken으로 세션 복구를 시도하는 중. 이 시간 동안 로그인/프로필 UI를 숨긴다. */
  isAuthLoading: boolean;
  /** 서버에서 최신 사용자 정보를 다시 조회해 인증 상태를 갱신한다. */
  refreshUser: () => Promise<AuthUser>;
  login: (email: string, password: string, next?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  /** 소셜 로그인 콜백 등 loginAction을 거치지 않는 경로에서 로그인 상태를 즉시 반영 */
  setUser: (user: AuthUser) => void;
}
