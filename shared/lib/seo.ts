import type { Metadata } from "next";

/** 검색엔진에 알리는 유일한 정식 프로덕션 주소. */
export const SITE_URL = "https://www.kkosunbox.com";

/** 정식 프로덕션 호스트명. dev.kkosunbox.com·preview·localhost 등과 구분하는 기준. */
export const PRODUCTION_HOST = new URL(SITE_URL).hostname;

/**
 * 검색엔진 색인 제외(noindex, nofollow).
 * 검색 노출 대상이 아닌 페이지(가입·로그인·마이페이지·주문·결제 등)에 사용한다.
 * 로그인·마이페이지·주문·결제 등 검색 노출 대상이 아닌 기능성 페이지에 사용한다.
 */
export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};

/** 내부 링크는 따라가되 검색 결과에는 노출하지 않는 공개 보조 문서용 정책. */
export const NOINDEX_FOLLOW_METADATA: Metadata = {
  robots: { index: false, follow: true },
};
