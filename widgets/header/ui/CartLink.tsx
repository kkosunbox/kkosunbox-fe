"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MEDIA_MD2_MIN } from "@/shared/config/breakpoints";
import { PACKAGE_SHEET_HREF } from "@/shared/config/packageSheet";
import { CartIcon } from "./icons";

const MAX_BADGE_COUNT = 99;

type CartLinkProps = {
  count: number;
  isSolid: boolean;
};

/** 장바구니 아이콘 — 단품몰(내 패키지)로 보낸다. 바텀시트를 쓰는 크기(<950px)면 시트를 연 채로 진입한다 */
export function CartLink({ count, isSolid }: CartLinkProps) {
  const router = useRouter();
  const hasItems = count > 0;
  const badgeLabel = count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count);

  return (
    <Link
      href="/products"
      onClick={(event) => {
        if (window.matchMedia(MEDIA_MD2_MIN).matches) return;
        event.preventDefault();
        router.push(PACKAGE_SHEET_HREF, { scroll: false });
      }}
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
