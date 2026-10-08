import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/shared/lib/seo";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "장바구니 | 꼬순박스",
  ...NOINDEX_METADATA,
};

// 비회원도 브라우저 장바구니를 쓰므로 로그인을 요구하지 않는다.
export default function CartPage() {
  return <CartPageClient />;
}
