const TRANSPARENT_ROUTES = [
  "/",
  "/subscribe",
  "/support",
  "/inquiry",
  "/partnership",
  "/mypage/review/write",
  "/mypage/subscription/change",
  "/mypage/withdraw",
];

export function isTransparentRoute(pathname: string): boolean {
  return (
    TRANSPARENT_ROUTES.includes(pathname) ||
    pathname.startsWith("/r/") ||
    pathname.startsWith("/support/")
  );
}
