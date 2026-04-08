export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string, next?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}
