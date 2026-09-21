"use client";
/* eslint-disable @next/next/no-img-element -- 상품 썸네일은 서버의 동적 원격 URL이다. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductDto } from "@/features/product/api/types";
import { addCartItem } from "@/features/cart";
import { notifyCartUpdated } from "@/features/cart/lib/events";
import { getErrorMessage } from "@/shared/lib/api";
import { formatKrwPrice } from "@/shared/lib/format";
import { useModal } from "@/shared/ui";
import Stars from "@/widgets/subscribe/plans/ui/reviews/Stars";
import ProductReviewList from "@/widgets/subscribe/plans/ui/reviews/ProductReviewList";
import ReviewImageLightbox from "@/widgets/subscribe/plans/ui/reviews/ReviewImageLightbox";
import { useProductReviews } from "@/widgets/subscribe/plans/ui/reviews/useProductReviews";

export default function IndependentProductDetailPage({ product }: { product: ProductDto }) {
  const router = useRouter();
  const { openAlert } = useModal();
  const [quantity, setQuantity] = useState(1);
  const reviews = useProductReviews(null, product.id);
  const unavailable = product.isSoldOut || product.isSalesPaused;
  const discountRate = product.originalPrice !== null && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  async function add(goToCart: boolean) {
    if (unavailable) return;
    try {
      await addCartItem({ productId: product.id, quantity });
      notifyCartUpdated();
      if (goToCart) router.push("/cart");
      else openAlert({ type: "success", title: "장바구니에 담았습니다.", primaryLabel: "장바구니 보기", onPrimary: () => router.push("/cart"), secondaryLabel: "계속 쇼핑하기" });
    } catch (error) { openAlert({ title: getErrorMessage(error, "장바구니에 담지 못했습니다.") }); }
  }

  const reviewListProps = {
    selectedPlanId: reviews.selectedPlanId,
    onChangePlan: reviews.changePlan,
    reviews: reviews.reviews,
    loading: reviews.loading,
    reviewImages: reviews.reviewImages,
    page: reviews.page,
    totalPages: reviews.totalPages,
    sort: reviews.sort,
    onChangeSort: reviews.changeSort,
    onChangePage: reviews.setPage,
    onOpenLightbox: reviews.openLightbox,
  };

  return <main className="mx-auto w-full max-w-content px-6 pb-20 pt-[calc(var(--header-offset)+40px)]">
    {reviews.lightbox && <ReviewImageLightbox urls={reviews.lightbox.urls} index={reviews.lightbox.index} onClose={reviews.closeLightbox} onNavigate={reviews.navigateLightbox} />}
    <div className="grid gap-8 md:grid-cols-2"><div className="aspect-square overflow-hidden rounded-[20px] bg-[var(--color-surface-warm)]">{product.imageUrl ? <img src={product.imageUrl} alt={`${product.name} 대표 이미지`} className="h-full w-full object-cover" /> : null}</div><div className="flex flex-col justify-center"><h1 className="text-[28px] font-extrabold text-[var(--color-text-emphasis)]">{product.name}</h1><div className="mt-3 flex items-center gap-2"><Stars rating={product.averageRating} size={24} /><span className="text-body-14-r text-[var(--color-text-secondary)]">리뷰 {product.reviewCount}개</span></div>{product.description && <p className="mt-6 whitespace-pre-line text-body-14-r leading-6 text-[var(--color-text-secondary)]">{product.description}</p>}<div className="mt-6 flex flex-wrap items-baseline gap-2">{discountRate !== null && <><span className="text-body-16-b text-[var(--color-primary)]">{discountRate}%</span><span className="text-body-14-r text-[var(--color-text-tertiary)] line-through">{formatKrwPrice(product.originalPrice!)}</span></>}<strong className="text-price-20-eb">{formatKrwPrice(product.price)}</strong></div><div className="mt-6 flex items-center gap-3"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-10 w-10 rounded border border-[var(--color-border)]">−</button><span className="w-8 text-center">{quantity}</span><button onClick={() => setQuantity((value) => Math.min(99, value + 1))} className="h-10 w-10 rounded border border-[var(--color-border)]">+</button></div><div className="mt-8 grid grid-cols-2 gap-3"><button disabled={unavailable} onClick={() => void add(false)} className="h-12 rounded-[8px] border border-[var(--color-cta-button)] font-semibold text-[var(--color-cta-button)] disabled:opacity-40">장바구니</button><button disabled={unavailable} onClick={() => void add(true)} className="h-12 rounded-[8px] bg-[var(--color-cta-button)] font-semibold text-white disabled:opacity-40">{product.isSoldOut ? "품절" : product.isSalesPaused ? "판매 중지" : "구매하기"}</button></div></div></div>
    <section className="mt-16 border-t pt-10"><h2 className="mb-6 text-[22px] font-bold">제품리뷰 {reviews.total}</h2><div className="md:hidden"><ProductReviewList variant="mobile" {...reviewListProps} /></div><div className="max-md:hidden"><ProductReviewList variant="desktop" {...reviewListProps} /></div></section>
  </main>;
}
