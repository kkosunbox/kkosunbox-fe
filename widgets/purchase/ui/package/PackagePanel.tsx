"use client";

import { PackageProgressBar, PackageProgressMessage, type CartPackage } from "@/features/cart";
import { formatKrwPrice } from "@/shared/lib/format";
import { PACKAGE_LIST_SCROLL_CLASS, PackageItemList, PackageShippingRow } from "./PackageItemList";

interface Props {
  pkg: CartPackage;
  canPurchase: boolean;
  onPurchase: () => void;
}

/** 단품몰 PC 레이아웃(≥950px) 우측 내 패키지 패널 — 그 아래는 바텀시트를 쓴다 */
export default function PackagePanel({ pkg, canPurchase, onPurchase }: Props) {
  const { progress } = pkg;
  return (
    <aside
      aria-labelledby="package-panel-title"
      className="sticky top-[calc(var(--header-offset)+24px)] w-[348px] shrink-0 rounded-xl bg-[var(--color-package-panel-bg)] px-6 pb-6 pt-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
    >
      <h2 id="package-panel-title" className="pl-1 text-[18px] font-semibold leading-[21px] tracking-[-0.04em] text-[var(--color-text-emphasis)]">내 패키지</h2>
      <div className="mt-3 rounded-xl bg-white px-2.5 pb-3.5 pt-[19px]">
        <p className="pl-[7px] text-[28px] font-extrabold leading-[32px] tracking-[-0.05em] text-[var(--color-cta-button)]"><span className="sr-only">담은 금액 </span>{formatKrwPrice(progress.amount)}</p>
        <div className="mt-6"><PackageProgressBar progress={progress} /></div>
        <p className="mt-[23px] flex h-8 items-center justify-center rounded-lg bg-[var(--color-surface-light)] text-[13px] leading-[1.6] tracking-[-0.04em] text-[var(--color-text)]" aria-live="polite">
          <span><PackageProgressMessage progress={progress} /></span>
        </p>
      </div>

      <h3 className="mt-6 border-b border-[var(--color-package-divider)] pb-3 pl-1 text-[18px] font-semibold leading-[21px] tracking-[-0.04em] text-[var(--color-text-emphasis)]">선택한 상품</h3>
      <div className={`h-[237px] ${PACKAGE_LIST_SCROLL_CLASS}`}>
        <PackageItemList cart={pkg.cart} pendingItemIds={pkg.pendingItemIds} changeQuantity={pkg.changeQuantity} remove={pkg.remove} className="pb-5 pt-3" />
      </div>
      <div className="border-t border-[var(--color-package-divider)] pt-3">
        <PackageShippingRow progress={progress} />
      </div>
      <button
        type="button"
        onClick={onPurchase}
        disabled={!canPurchase}
        className="mt-6 h-12 w-full rounded-lg bg-[var(--color-cta-button)] text-[16px] font-semibold leading-[1.5] tracking-[-0.02em] text-white disabled:opacity-40"
      >
        패키지 구매하기
      </button>
    </aside>
  );
}
