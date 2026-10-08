export function isTransparentRoute(pathname: string): boolean {
  // `/r/{slug}` 초대 랜딩도 메인처럼 Hero 위에 투명 헤더를 띄운다.
  return pathname === "/" || pathname.startsWith("/r/");
}
