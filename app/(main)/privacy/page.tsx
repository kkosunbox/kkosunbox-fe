import type { Metadata } from "next";
import { PrivacySection } from "@/widgets/privacy";
import { NOINDEX_FOLLOW_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 꼬순박스",
  description: "꼬순박스 개인정보처리방침을 확인하세요.",
  alternates: { canonical: "/privacy" },
  ...NOINDEX_FOLLOW_METADATA,
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="sr-only">꼬순박스 개인정보처리방침</h1>
      <PrivacySection />
    </>
  );
}
