import Link from "next/link";
import { CartIcon } from "./icons";

const MAX_BADGE_COUNT = 99;

type CartLinkProps = {
  count: number;
  isSolid: boolean;
};

export function CartLink({ count, isSolid }: CartLinkProps) {
  const hasItems = count > 0;
  const badgeLabel = count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count);

  return (
    <Link
      href="/cart"
      aria-label={hasItems ? `장바구니 ${count}건` : "장바구니"}
      className={`relative flex items-center justify-center transition-colors duration-300 ${
        isSolid
          ? "text-[var(--color-header-icon)] hover:text-primary"
          : "text-white hover:text-white/80"
      }`}
    >
      <CartIcon />
      {hasItems && (
        <span
          className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-badge-count-bg)] px-[3px] text-body-10-m text-white"
          aria-hidden="true"
        >
          {badgeLabel}
        </span>
      )}
    </Link>
  );
}
