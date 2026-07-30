// ⚠️ 비활성 라우트 — proxy.ts DISABLED_ROUTES가 /shop 전체를 "/"로 리다이렉트한다(광고 집행 전 잠정 비활성화).
// Toss 연동 관련 상세는 widgets/shop/ui/ShopOrderSection.tsx, shared/lib/payments/tossPaymentConfirm.ts 상단 주석 참고.
import type { Metadata } from "next";
import { ShopListSection } from "@/widgets/shop";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "간식 스토어 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default function ShopPage() {
  return <ShopListSection />;
}
