import { NOINDEX_METADATA } from "@/shared/lib/seo";

// 추천인 초대 랜딩(/ref/[slug])은 개인화 페이지이므로 색인 제외.
export const metadata = NOINDEX_METADATA;

export default function RefLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
