"use client";
/* eslint-disable @next/next/no-img-element -- 카탈로그 이미지는 서버의 동적 원격 URL이다. */

import Link from "next/link";
import { useState } from "react";
import { ModalShell } from "@/shared/ui";
import { formatKrwPrice } from "@/shared/lib/format";
import type { ProductDto } from "@/features/product/api";
import type { OrderPolicyDto } from "@/shared/lib/orderPolicy";
import type { CartDto } from "../api";
import { getPackageProgress } from "../lib/packageProgress";
import { PackageProgressBar, PackageProgressMessage } from "./PackageProgressBar";

interface Props {
  cart: CartDto;
  /** 주문 정책 — 조회 전이면 null (최소 주문 마커는 0원으로 표시) */
  policy: OrderPolicyDto | null;
  recommendations: ProductDto[];
  pendingProductId: number | null;
  error: string | null;
  onAdd: (productId: number) => Promise<boolean>;
  onReplaceRecommendation: (productId: number) => "replaced" | "removed" | false;
  onClose: () => void;
}

const CARD_FADE_DURATION_MS = 180;

function waitForFade() {
  return new Promise<void>((resolve) => window.setTimeout(resolve, CARD_FADE_DURATION_MS));
}

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  });
}

export function CartAddedModal({ cart, policy, recommendations, pendingProductId, error, onAdd, onReplaceRecommendation, onClose }: Props) {
  const progress = getPackageProgress(cart, policy);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [cardVisible, setCardVisible] = useState(true);
  const [replacementAnnouncement, setReplacementAnnouncement] = useState("");
  const [recommendationsCompleted, setRecommendationsCompleted] = useState(false);

  async function handleRecommendationAdd(productId: number, index: number, productName: string) {
    if (animatingIndex !== null || pendingProductId !== null) return;
    const added = await onAdd(productId);
    if (!added) return;

    setAnimatingIndex(index);
    setCardVisible(false);
    await waitForFade();
    const replacementResult = onReplaceRecommendation(productId);
    await waitForNextPaint();
    setCardVisible(true);
    await waitForFade();
    setAnimatingIndex(null);
    if (replacementResult === "replaced") {
      setReplacementAnnouncement(`${productName}을 내 패키지에 담고 새로운 추천 상품을 표시했습니다.`);
    } else if (replacementResult === "removed") {
      setReplacementAnnouncement(`${productName}을 내 패키지에 담았습니다.`);
      if (recommendations.length === 1) setRecommendationsCompleted(true);
    }
  }

  return (
    <ModalShell label="내 패키지 담기 완료" onClose={onClose} backdrop="default" className="flex min-h-full items-center justify-center p-4">
      <div className="relative w-full max-w-[440px] rounded-[14px] bg-white p-7 shadow-xl max-sm:p-5">
        <div className="flex items-center gap-3 pr-7">
          <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="none" className="shrink-0 text-[var(--color-cta-button)]">
            <path d="M12 16L14.6667 18.6667L20 13.3333M28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-subtitle-18-b tracking-[-0.04em] text-[var(--color-text-emphasis)] max-sm:text-subtitle-16-b">내 패키지에 상품을 담았어요.</h2>
        </div>
        <button type="button" aria-label="닫기" onClick={onClose} className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center text-[var(--color-border)]">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        <div className="mt-6" aria-live="polite" aria-atomic="true">
          <p className="mb-4 text-subtitle-24-b tracking-[-0.04em] text-[var(--color-cta-button)]"><span className="sr-only">담은 금액 </span>{formatKrwPrice(progress.amount)}</p>
          <PackageProgressBar progress={progress} />
          <p className="mt-3 rounded-[8px] bg-[var(--color-surface-light)] px-3 py-2 text-center text-body-13-m tracking-[-0.04em] text-[var(--color-text)]">
            <PackageProgressMessage progress={progress} />
          </p>
        </div>

        {recommendations.length > 0 && <ul aria-label="함께 담기 좋은 상품" className="mt-6 grid grid-cols-3 gap-3 max-sm:gap-2">
          {recommendations.map((product, index) => {
            const discounted = product.originalPrice != null && product.originalPrice > product.price;
            const isAnimating = animatingIndex === index;
            return <li
              key={product.id}
              className={`min-w-0 transition-opacity duration-[180ms] ease-in-out motion-reduce:transition-none ${isAnimating && !cardVisible ? "opacity-0" : "opacity-100"}`}
            >
              <div className="aspect-[120/112] overflow-hidden rounded-[6px] bg-[var(--color-surface-light)]">
                {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />}
              </div>
              <p className="mt-2 text-body-13-m tracking-[-0.04em] text-[var(--color-text-emphasis)] max-md:min-h-10 md:min-h-5">{product.name}</p>
              <div className="mt-1 flex flex-wrap items-end justify-between gap-1">
                <div>
                  {discounted && <p className="flex flex-wrap items-center gap-1"><span className="text-body-12-sb text-[var(--color-cta-button)]">{Math.round((1 - product.price / product.originalPrice!) * 100)}%</span><del className="text-[10px] text-[var(--color-text-secondary)]">{formatKrwPrice(product.originalPrice!)}</del></p>}
                  <p className="text-body-14-b text-[var(--color-text-emphasis)]">{formatKrwPrice(product.price)}</p>
                </div>
                <button type="button" aria-label={`${product.name} 내 패키지에 담기`} disabled={pendingProductId !== null || animatingIndex !== null} onClick={() => void handleRecommendationAdd(product.id, index, product.name)} className="shrink-0 rounded-[5px] text-[var(--color-cta-button)] disabled:opacity-40">
                  <svg aria-hidden="true" width="26" height="26" viewBox="0 0 26 26" fill="none">
                    <rect x="0.5" y="0.5" width="25" height="25" rx="4.5" fill="white" stroke="currentColor" />
                    <path d="M10.332 12V9.33333C10.332 7.86057 11.5259 6.66667 12.9987 6.66667C14.4715 6.66667 15.6654 7.86057 15.6654 9.33333V12M7.36102 13.6678C7.50609 11.9269 7.57863 11.0565 8.15271 10.5282C8.7268 10 9.60027 10 11.3472 10H14.6528C16.3997 10 17.2732 10 17.8473 10.5282C18.4214 11.0565 18.4939 11.9269 18.639 13.6678L18.8195 15.8339C18.904 16.8474 18.9462 17.3542 18.6491 17.6771C18.352 18 17.8435 18 16.8264 18H9.1736C8.15655 18 7.64802 18 7.35092 17.6771C7.05382 17.3542 7.09605 16.8474 7.18051 15.8339L7.36102 13.6678Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </li>;
          })}
        </ul>}
        {recommendationsCompleted && (
          <div className="mt-6 rounded-[8px] bg-[var(--color-surface-light)] px-4 py-5 text-center">
            <p className="text-body-14-b text-[var(--color-text-emphasis)]">함께 담기 좋은 상품을 모두 담았어요!</p>
            <p className="mt-1 text-body-13-m text-[var(--color-text-secondary)]">담은 상품은 내 패키지에서 확인해 주세요.</p>
          </div>
        )}
        <p className="sr-only" aria-live="polite">{replacementAnnouncement}</p>
        {error && <p role="alert" className="mt-4 text-body-13-m text-[var(--color-text-discount)]">{error}</p>}
        <button data-autofocus type="button" onClick={onClose} className="mt-9 h-12 w-full rounded-[8px] bg-[var(--color-cta-button)] text-body-16-sb text-white">계속쇼핑</button>
        <Link href="/products" onClick={onClose} className="mx-auto mt-3 block w-fit text-body-14-m text-[var(--color-text-secondary)] underline underline-offset-2">내 패키지 보기</Link>
      </div>
    </ModalShell>
  );
}
