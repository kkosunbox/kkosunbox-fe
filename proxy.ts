import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/features/auth/lib/constants";
import {
  INVITE_CODE_COOKIE,
  INVITE_CODE_MAX_AGE_SEC,
  isValidInviteCode,
} from "@/features/referral/lib";

/** 로그인 없이 접근 불가한 라우트 */
const PROTECTED = ["/mypage", "/order"];

/** 이미 로그인 상태에서 접근 시 홈으로 보낼 라우트 */
const AUTH_ONLY = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 레퍼럴 캡처 — 인증 가드보다 먼저 처리한다.
  // `?ref=CODE`로 진입하면 코드를 쿠키에 저장하고 ref를 제거한 깨끗한 URL로 보낸다.
  // 인증과 독립된 non-httpOnly 쿠키이므로 로그인/로그아웃에도 유지되고,
  // 비로그인 상태로 보호 라우트에 진입해도 이 리다이렉트 후 followup 요청에서 로그인 가드가 적용된다.
  const ref = request.nextUrl.searchParams.get("ref");
  if (ref) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("ref");
    const res = NextResponse.redirect(url);

    const code = ref.trim();
    if (isValidInviteCode(code)) {
      res.cookies.set(INVITE_CODE_COOKIE, code, {
        path: "/",
        maxAge: INVITE_CODE_MAX_AGE_SEC,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        // httpOnly 미지정 → 주문 페이지(클라이언트)에서 읽어 validate에 사용
      });
    }
    return res;
  }

  const token  = request.cookies.get(COOKIE_NAME)?.value;
  const authed = Boolean(token);

  if (PROTECTED.some((r) => pathname.startsWith(r)) && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const returnTo = `${pathname}${request.nextUrl.search}`;
    url.searchParams.set("next", returnTo);
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
