import type { Metadata } from "next";
import { AboutSection } from "@/widgets/about";
import { JsonLd } from "@/shared/ui";
import { SITE_URL } from "@/shared/lib/seo";

const description =
  "100% 국내산 휴먼그레이드 재료로 만든 강아지 수제간식, 꼬순박스를 소개합니다. 믿고 먹일 수 있는 간식의 기준을 만드는 프리미엄 정기구독 브랜드 이야기.";

export const metadata: Metadata = {
  title: "꼬순박스 소개 | 꼬순박스",
  description,
  openGraph: {
    title: "꼬순박스 소개 | 꼬순박스",
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "꼬순박스" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "꼬순박스 소개 | 꼬순박스",
    description,
    images: ["/og-image.png"],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "꼬순박스 소개", item: `${SITE_URL}/about` },
  ],
};

export default function AboutPage() {
  return (
    <div className="max-lg:mt-[var(--banner-height)]">
      <JsonLd data={breadcrumbJsonLd} />
      <AboutSection />
    </div>
  );
}
