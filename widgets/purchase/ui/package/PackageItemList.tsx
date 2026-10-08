"use client";

/* eslint-disable @next/next/no-img-element -- 상품 이미지는 서버가 제공하는 동적 원격 URL이다. */

import { formatManwon, type CartPackage, type PackageProgress } from "@/features/cart";
import { formatKrwPrice } from "@/shared/lib/format";
import { QuantityMinusIcon, QuantityPlusIcon } from "@/shared/ui";

type Props = Pick<CartPackage, "cart" | "pendingItemIds" | "changeQuantity" | "remove"> & {
  /** 목록 위·아래 여백 — PC 패널과 모바일 시트가 다르다 */
  className?: string;
};

/**
 * 선택상품 목록 스크롤 영역 — 스크롤바를 패널 좌우 여백 쪽(오른쪽 12px)으로 빼서 X 버튼과 띄우고,
 * 4px 둥근 thumb + 투명 트랙으로 얇게 그린다. gutter를 고정해 스크롤 유무와 관계없이 목록 폭이 같다.
 * (::-webkit-scrollbar 미지원 브라우저(Firefox)는 표준 thin 스크롤바)
 */
export const PACKAGE_LIST_SCROLL_CLASS = [
  "-mr-3 overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable]",
  "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--color-ui-disabled)]",
  "hover:[&::-webkit-scrollbar-thumb]:bg-[var(--color-text-secondary)]",
  "supports-[not_selector(::-webkit-scrollbar)]:[scrollbar-width:thin]",
  "supports-[not_selector(::-webkit-scrollbar)]:[scrollbar-color:var(--color-ui-disabled)_transparent]",
].join(" ");

function CloseIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M16 8L8 16M8 8L16 16" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 내 패키지에 담긴 상품 목록 — PC 패널·모바일 바텀시트 공용 */
export function PackageItemList({ cart, pendingItemIds, changeQuantity, remove, className = "" }: Props) {
  const items = cart?.items ?? [];
  if (items.length === 0) {
    return (
      <p className="flex h-full min-h-[120px] items-center justify-center text-[13px] leading-[1.6] tracking-[-0.04em] text-[var(--color-text-label)]">
        선택한 상품이 없습니다.
      </p>
    );
  }

  return (
    <ul className={`flex flex-col gap-5 ${className}`}>
      {items.map((item) => {
        const pending = pendingItemIds.has(item.id);
        return (
          <li key={item.id} className="flex h-[52px] items-center">
            <div className={`h-[52px] w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-light)] ${item.isOrderable ? "" : "opacity-50"}`}>
              {item.imageUrl && <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="ml-2 min-w-0 flex-1">
              <p className={`truncate text-[13px] font-medium leading-4 tracking-[-0.04em] ${item.isOrderable ? "text-[var(--color-text-price)]" : "text-[var(--color-text-secondary)]"}`}>{item.productName}</p>
              {item.isOrderable
                ? <p className="mt-[9px] text-[16px] font-bold leading-[19px] tracking-[-0.05em] text-[var(--color-text-price)]">{formatKrwPrice(item.itemAmount)}</p>
                : <p className="mt-[9px] text-[12px] leading-4 tracking-[-0.04em] text-[var(--color-primary)]">{item.unavailableReason ?? "현재 주문할 수 없는 상품입니다."}</p>}
            </div>
            {item.isOrderable && (
              <div className="ml-2 flex h-6 shrink-0 items-center gap-3 rounded-xl bg-white" aria-busy={pending}>
                <button type="button" onClick={() => void changeQuantity(item.id, item.quantity - 1)} disabled={pending || item.quantity <= 1} aria-label={`${item.productName} 수량 감소`} className="disabled:opacity-40"><QuantityMinusIcon /></button>
                <span className="min-w-[7px] text-center text-[12px] font-medium leading-[14px] tracking-[-0.02em] text-black" aria-live="polite">{item.quantity}</span>
                <button type="button" onClick={() => void changeQuantity(item.id, item.quantity + 1)} disabled={pending} aria-label={`${item.productName} 수량 증가`} className="disabled:opacity-40"><QuantityPlusIcon /></button>
              </div>
            )}
            <button
              type="button"
              onClick={() => void remove(item.id)}
              disabled={pending}
              aria-label={`${item.productName} 삭제`}
              className="ml-[11px] flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-white disabled:opacity-40"
            >
              <CloseIcon />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** 배송비 행 — 담은 상품이 없으면 정책의 기본 배송비, 있으면 견적 배송비. 무료배송이면 원래 배송비에 취소선 */
export function PackageShippingRow({ progress }: { progress: PackageProgress }) {
  const { shippingFee, baseShippingFee, isFree } = progress;
  const threshold = progress.threshold > 0 ? formatManwon(progress.threshold) : null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] font-semibold leading-[17px] tracking-[-0.04em] text-[var(--color-text-emphasis)]">배송비</span>
      <div className="text-right">
        <p className="text-[14px] font-semibold leading-[17px] tracking-[-0.04em] text-[var(--color-text-emphasis)]">
          {isFree && baseShippingFee > 0 && (
            <del className="mr-1.5 font-medium text-[var(--color-text-secondary)]"><span className="sr-only">원래 배송비 </span>{formatKrwPrice(baseShippingFee)}</del>
          )}
          {formatKrwPrice(shippingFee)}
        </p>
        {threshold && <p className="mt-1 text-[13px] leading-[1.6] tracking-[-0.04em] text-[var(--color-text-label)]">{threshold} 이상 무료배송</p>}
      </div>
    </div>
  );
}
