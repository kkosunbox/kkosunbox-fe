import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import CartPageClient from "./CartPageClient";

export const metadata = { title: "장바구니 | 꼬순박스" };

export default async function CartPage() {
  if (!(await getServerToken())) redirect("/login?next=/cart");
  return <CartPageClient />;
}
