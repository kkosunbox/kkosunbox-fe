import { SocialRegisterSection } from "@/widgets/register";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = {
  title: "소셜 회원가입 디자인 검수 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default function SocialRegisterPreviewPage() {
  return <SocialRegisterSection preview />;
}
