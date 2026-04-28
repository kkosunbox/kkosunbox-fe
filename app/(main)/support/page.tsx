import type { Metadata } from "next";
import { SupportSection } from "@/widgets/support/faq";

const description = "꼬순박스 이용 중 궁금한 점이 있으신가요? 자주 묻는 질문과 1:1 문의를 통해 빠르게 도움드립니다.";

export const metadata: Metadata = {
  title: "고객센터 | 꼬순박스",
  description,
  openGraph: {
    title: "고객센터 | 꼬순박스",
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "꼬순박스" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "고객센터 | 꼬순박스",
    description,
    images: ["/og-image.png"],
  },
};

export default function SupportPage() {
  return <SupportSection />;
}
