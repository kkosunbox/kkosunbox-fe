import type { Metadata } from "next";
import { TermsSection } from "@/widgets/terms";
import { NOINDEX_FOLLOW_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "이용약관 | 꼬순박스",
  description: "꼬순박스 서비스 이용약관을 확인하세요.",
  alternates: { canonical: "/terms" },
  ...NOINDEX_FOLLOW_METADATA,
};

export default function TermsPage() {
  return (
    <>
      <h1 className="sr-only">꼬순박스 이용약관</h1>
      <TermsSection />
    </>
  );
}
