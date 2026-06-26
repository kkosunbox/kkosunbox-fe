import { NOINDEX_METADATA } from "@/shared/lib/seo";

// 디자인/결제 테스트 페이지는 검색 색인 제외.
export const metadata = NOINDEX_METADATA;

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
