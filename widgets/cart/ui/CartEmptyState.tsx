import Link from "next/link";
import { Button } from "@/shared/ui";

export function CartEmptyState() {
  return (
    <div className="rounded-2xl bg-[var(--color-surface-warm)] p-12 text-center">
      <p className="mb-6 text-[var(--color-text-secondary)]">장바구니가 비어 있습니다.</p>
      <Button as={Link} href="/purchase">단품몰 보기</Button>
    </div>
  );
}
