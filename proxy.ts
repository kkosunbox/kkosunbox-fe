import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/features/auth/lib/constants";
import {
  INVITE_CODE_COOKIE,
  INVITE_CODE_MAX_AGE_SEC,
  isValidInviteCode,
} from "@/features/referral/lib";
import { SITE_URL } from "@/shared/lib/seo";

/** 로그인 없이 접근 불가한 라우트 */
const PROTECTED = ["/mypage", "/order"];

/**
 * 개발 전용 라우트 — 정식 프로덕션 도메인에서만 홈으로 리다이렉트한다.
 * `/test`는 디자인 시스템 패널과 Toss 결제위젯 데모(`/test/toss`)를 포함한다.
 * noindex 메타(app/(main)/test/layout.tsx)만으로는 색인만 막힐 뿐 URL 직접 접근은 열려 있어,
 * 실사용자가 커머스 도메인에서 결제 테스트 화면에 도달할 수 있었다.
 *
 * 정식 프로덕션 도메인은 검색 canonical과 동일한 www 호스트를 사용한다.
 * localhost·dev.kkosunbox.com·preview 에서는 그대로 열려 있어 디자인 확인에 지장이 없다.
 */
const DEV_ONLY_ROUTES = ["/test"];

const PRODUCTION_HOST = new URL(SITE_URL).hostname;
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProductionHost = request.nextUrl.hostname === PRODUCTION_HOST;

  // 레퍼럴 캡처 — 인증 가드보다 먼저 처리한다.
  // `?r=CODE`로 진입하면 코드를 쿠키에 저장하고 r을 제거한 깨끗한 URL로 보낸다.
  // 인증과 독립된 non-httpOnly 쿠키이므로 로그인/로그아웃에도 유지되고,
  // 비로그인 상태로 보호 라우트에 진입해도 이 리다이렉트 후 followup 요청에서 로그인 가드가 적용된다.
  const ref = request.nextUrl.searchParams.get("r");
  if (ref) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("r");
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

  if (isProductionHost && DEV_ONLY_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
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

  const response = NextResponse.next();

  // preview·dev·localhost 등 정식 호스트가 아닌 배포본은 검색 결과에서 제외한다.
  // canonical만으로는 별도 호스트의 색인을 완전히 막을 수 없어 응답 헤더도 함께 제공한다.
  if (request.nextUrl.hostname !== PRODUCTION_HOST) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    // 정적 파일, _next 내부, API, favicon 제외
    "/((?!_next/static|_next/image|favicon.ico|fonts|images|icons).*)",
  ],
};
