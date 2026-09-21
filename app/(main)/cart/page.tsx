import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { NOINDEX_METADATA } from "@/shared/lib/seo";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "장바구니 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function CartPage() {
  if (!(await getServerToken())) redirect("/login?next=/cart");
  return <CartPageClient />;
}
