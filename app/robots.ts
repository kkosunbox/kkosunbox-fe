import type { MetadataRoute } from "next";

// 정식 프로덕션 도메인(apex, www 없음). 이 도메인에서 빌드/서빙될 때만 색인을 허용한다.
// OAuth 콜백·canonical 모두 apex 기준이므로 www를 붙이면 색인이 통째로 막힌다.
const PRODUCTION_URL = "https://kkosunbox.com";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const isProduction = siteUrl === PRODUCTION_URL;

export default function robots(): MetadataRoute.Robots {
  // dev.kkosunbox.com·preview·localhost 등 정식 도메인이 아닌 환경은 전체 색인 차단.
  if (!isProduction) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  // 프로덕션: 크롤링 허용(페이지별 noindex는 메타로 제어) + sitemap 위치 안내.
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${PRODUCTION_URL}/sitemap.xml`,
    host: PRODUCTION_URL,
  };
}
