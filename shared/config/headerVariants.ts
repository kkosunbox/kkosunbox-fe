const TRANSPARENT_ROUTES = [
  "/",
  "/mypage/subscription/change",
  "/mypage/withdraw",
];

export function isTransparentRoute(pathname: string): boolean {
  return (
    TRANSPARENT_ROUTES.includes(pathname) ||
    pathname.startsWith("/r/")
  );
}
