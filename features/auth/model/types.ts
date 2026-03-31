export interface AuthUser {
  id: string;
  name: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (id: string, password: string, next?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}
