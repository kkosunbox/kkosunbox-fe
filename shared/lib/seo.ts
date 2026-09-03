import type { Metadata } from "next";

/** 정식 프로덕션 도메인. 구조화 데이터(JSON-LD)의 절대 URL 등에 사용한다. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * 검색엔진 색인 제외(noindex, nofollow).
 * 검색 노출 대상이 아닌 페이지(가입·로그인·마이페이지·주문·결제 등)에 사용한다.
 * 로그인·마이페이지·주문·결제 등 검색 노출 대상이 아닌 기능성 페이지에 사용한다.
 */
export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};
