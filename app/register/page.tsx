import { RegisterSection } from "@/widgets/register";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = {
  title: "회원가입 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default function RegisterPage() {
  return <RegisterSection />;
}
