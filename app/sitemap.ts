import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/lib/seo";

// 검색 노출 대상 4개 페이지만 등록한다(나머지는 noindex). 우선순위: 메인 > 소개 > 구독 > 고객지원.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/subscribe`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/support`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];
}
