import type { Metadata } from "next";
import { TermsSection } from "@/widgets/terms";

export const metadata: Metadata = {
  title: "이용약관 | 꼬순박스",
  description: "꼬순박스 서비스 이용약관을 확인하세요.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <TermsSection />;
}
