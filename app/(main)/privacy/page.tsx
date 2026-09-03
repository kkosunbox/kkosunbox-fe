import type { Metadata } from "next";
import { PrivacySection } from "@/widgets/privacy";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 꼬순박스",
  description: "꼬순박스 개인정보처리방침을 확인하세요.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacySection />;
}
