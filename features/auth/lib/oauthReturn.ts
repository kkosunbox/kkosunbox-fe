const OAUTH_RETURN_KEY = "ggosoon-oauth-return";

/** OAuth 시작 전 복귀 경로를 sessionStorage에 저장한다. 상대 경로만 허용. */
export function setOAuthReturnPath(path: string): void {
  if (typeof sessionStorage === "undefined") return;
  if (!path.startsWith("/")) return;
  sessionStorage.setItem(OAUTH_RETURN_KEY, path);
}

/** OAuth 콜백 후 복귀 경로를 읽고 삭제한다. 없으면 null. */
export function consumeOAuthReturnPath(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  const path = sessionStorage.getItem(OAUTH_RETURN_KEY);
  sessionStorage.removeItem(OAUTH_RETURN_KEY);
  if (!path?.startsWith("/")) return null;
  return path;
}
