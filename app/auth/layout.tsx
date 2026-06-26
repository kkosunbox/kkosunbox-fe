import { NOINDEX_METADATA } from "@/shared/lib/seo";

// /auth/callback 등 인증 콜백 페이지는 검색 색인 제외.
export const metadata = NOINDEX_METADATA;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
