const TRANSPARENT_ROUTES = [
  "/",
  "/about",
  "/subscribe",
  "/support",
  "/inquiry",
  "/mypage/review/write",
  "/mypage/subscription/change",
  "/mypage/withdraw",
];

export function isTransparentRoute(pathname: string): boolean {
  return (
    TRANSPARENT_ROUTES.includes(pathname) ||
    pathname.startsWith("/ref/") ||
    pathname.startsWith("/support/")
  );
}
