import { NOINDEX_METADATA } from "@/shared/lib/seo";

// 구독 플랜 상세(planId 파라미터 기반)는 색인 대상이 아니다. 색인 대상은 /subscribe 까지.
export const metadata = NOINDEX_METADATA;

export default function SubscribeDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
