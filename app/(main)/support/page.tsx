import type { Metadata } from "next";
import { FAQ_ITEMS, SupportSection } from "@/widgets/support/faq";
import { JsonLd } from "@/shared/ui";
import { SITE_URL } from "@/shared/lib/seo";

const description = "꼬순박스 이용 중 궁금한 점이 있으신가요? 자주 묻는 질문과 1:1 문의를 통해 빠르게 도움드립니다.";

const breadcrumbJsonLd = {
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "고객센터", item: `${SITE_URL}/support` },
  ],
};

export const metadata: Metadata = {
  title: "고객센터 | 꼬순박스",
  description,
  alternates: { canonical: "/support" },
  openGraph: {
    title: "고객센터 | 꼬순박스",
    description,
    url: "/support",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "꼬순박스" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "고객센터 | 꼬순박스",
    description,
    images: ["/og-image.png"],
  },
};

const supportJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbJsonLd,
    {
      "@type": "FAQPage",
      name: "꼬순박스 자주 묻는 질문",
      url: `${SITE_URL}/support`,
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.fullAnswer,
        },
      })),
    },
  ],
};

export default function SupportPage() {
  return (
    <>
      <h1 className="sr-only">꼬순박스 고객센터 및 자주 묻는 질문</h1>
      <JsonLd data={supportJsonLd} />
      <SupportSection fillViewport />
    </>
  );
}
