"use client";
/* eslint-disable @next/next/no-img-element -- 카탈로그 이미지는 서버의 동적 원격 URL이다. */

import Link from "next/link";
import { ModalShell } from "@/shared/ui";
import { formatKrwPrice } from "@/shared/lib/format";
import type { ProductDto } from "@/features/product/api";
import type { CartDto } from "../api";
import { getCartShippingProgress } from "../lib/cartAdded";

interface Props {
  cart: CartDto;
  recommendations: ProductDto[];
  pendingProductId: number | null;
  error: string | null;
  onAdd: (productId: number) => void;
  onClose: () => void;
}

export function CartAddedModal({ cart, recommendations, pendingProductId, error, onAdd, onClose }: Props) {
  const shipping = getCartShippingProgress(cart);
  return (
    <ModalShell label="장바구니 담기 완료" onClose={onClose} backdrop="default" className="flex min-h-full items-center justify-center p-4">
      <div className="relative w-full max-w-[440px] rounded-[14px] bg-white p-7 shadow-xl max-sm:p-5">
        <div className="flex items-center gap-3 pr-7">
          <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="none" className="shrink-0 text-[var(--color-cta-button)]">
            <path d="M12 16L14.6667 18.6667L20 13.3333M28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-subtitle-18-b tracking-[-0.04em] text-[var(--color-text-emphasis)] max-sm:text-subtitle-16-b">장바구니에 상품을 담았어요.</h2>
        </div>
        <button type="button" aria-label="닫기" onClick={onClose} className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center text-[var(--color-border)]">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        <div className="mt-3" aria-live="polite" aria-atomic="true">
          <div className="relative pt-6">
            <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-body-14-b text-[var(--color-text)]" style={{ left: `clamp(44px, ${shipping.percent}%, calc(100% - 44px))` }}>{formatKrwPrice(shipping.amount)}</span>
            <div role="progressbar" aria-label="무료배송까지 담은 금액" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(shipping.percent)} className="h-2 overflow-hidden rounded-full bg-[var(--color-text-muted)]">
              <div className="h-full rounded-full bg-[var(--color-cta-button)] transition-[width]" style={{ width: `${shipping.percent}%` }} />
            </div>
            <span aria-hidden="true" className="absolute bottom-[-5px] h-[18px] w-[18px] -translate-x-1/2 rounded-full border-[4px] border-[var(--color-cta-button)] bg-white" style={{ left: `clamp(9px, ${shipping.percent}%, calc(100% - 9px))` }} />
          </div>
          <p className="mt-5 text-center text-body-13-m leading-4 tracking-[-0.04em] text-[var(--color-text)]">
            {shipping.isFree ? "무료배송 혜택이 적용되었어요!" : shipping.remaining > 0 ? <><span className="text-[var(--color-cta-button)]">{formatKrwPrice(shipping.remaining)}</span> 더 주문하면 무료배송</> : <>배송비 {formatKrwPrice(cart.shippingFee)}</>}
            {!shipping.isFree && shipping.threshold > 0 && <span className="text-[var(--color-text-secondary)]"> ({formatKrwPrice(shipping.threshold)} 이상 무료배송)</span>}
          </p>
        </div>

        {recommendations.length > 0 && <ul aria-label="함께 담기 좋은 상품" className="mt-6 grid grid-cols-3 gap-3 max-sm:gap-2">
          {recommendations.map((product) => {
            const discounted = product.originalPrice != null && product.originalPrice > product.price;
            return <li key={product.id} className="min-w-0">
              <div className="aspect-[120/112] overflow-hidden rounded-[6px] bg-[var(--color-surface-light)]">
                {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />}
              </div>
              <p className="mt-2 text-body-13-m tracking-[-0.04em] text-[var(--color-text-emphasis)] max-md:min-h-10 md:min-h-5">{product.name}</p>
              <div className="mt-1 flex flex-wrap items-end justify-between gap-1">
                <div>
                  {discounted && <p className="flex flex-wrap items-center gap-1"><span className="text-body-12-sb text-[var(--color-cta-button)]">{Math.round((1 - product.price / product.originalPrice!) * 100)}%</span><del className="text-[10px] text-[var(--color-text-secondary)]">{formatKrwPrice(product.originalPrice!)}</del></p>}
                  <p className="text-body-14-b text-[var(--color-text-emphasis)]">{formatKrwPrice(product.price)}</p>
                </div>
                <button type="button" aria-label={`${product.name} 장바구니 담기`} disabled={pendingProductId !== null} onClick={() => onAdd(product.id)} className="shrink-0 rounded-[5px] text-[var(--color-cta-button)] disabled:opacity-40">
                  <svg aria-hidden="true" width="26" height="26" viewBox="0 0 26 26" fill="none">
                    <rect x="0.5" y="0.5" width="25" height="25" rx="4.5" fill="white" stroke="currentColor" />
                    <path d="M10.332 12V9.33333C10.332 7.86057 11.5259 6.66667 12.9987 6.66667C14.4715 6.66667 15.6654 7.86057 15.6654 9.33333V12M7.36102 13.6678C7.50609 11.9269 7.57863 11.0565 8.15271 10.5282C8.7268 10 9.60027 10 11.3472 10H14.6528C16.3997 10 17.2732 10 17.8473 10.5282C18.4214 11.0565 18.4939 11.9269 18.639 13.6678L18.8195 15.8339C18.904 16.8474 18.9462 17.3542 18.6491 17.6771C18.352 18 17.8435 18 16.8264 18H9.1736C8.15655 18 7.64802 18 7.35092 17.6771C7.05382 17.3542 7.09605 16.8474 7.18051 15.8339L7.36102 13.6678Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </li>;
          })}
        </ul>}
        {error && <p role="alert" className="mt-4 text-body-13-m text-[var(--color-text-discount)]">{error}</p>}
        <button data-autofocus type="button" onClick={onClose} className="mt-9 h-12 w-full rounded-[8px] bg-[var(--color-cta-button)] text-body-16-sb text-white">계속쇼핑</button>
        <Link href="/cart" onClick={onClose} className="mx-auto mt-3 block w-fit text-body-14-m text-[var(--color-text-secondary)] underline underline-offset-2">장바구니 바로가기</Link>
      </div>
    </ModalShell>
  );
}
