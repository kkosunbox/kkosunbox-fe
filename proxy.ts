import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/features/auth/lib/constants";

/** 로그인 없이 접근 불가한 라우트 */
const PROTECTED = ["/mypage"];

/** 이미 로그인 상태에서 접근 시 홈으로 보낼 라우트 */
const AUTH_ONLY = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token      = request.cookies.get(COOKIE_NAME)?.value;
  const devToken   = process.env.DEV_AUTH_TOKEN ?? "dev-ggosoon-token";
  const authed     = token === devToken;

  if (PROTECTED.some((r) => pathname.startsWith(r)) && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname); // 로그인 후 돌아올 경로
    return NextResponse.redirect(url);
  }

  if (AUTH_ONLY.some((r) => pathname.startsWith(r)) && authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 정적 파일, _next 내부, API, favicon 제외
    "/((?!_next/static|_next/image|favicon.ico|fonts|images|icons).*)",
  ],
};
