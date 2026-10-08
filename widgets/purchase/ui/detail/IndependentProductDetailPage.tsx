"use client";
/* eslint-disable @next/next/no-img-element -- 상품 썸네일은 서버의 동적 원격 URL이다. */

import { Fragment, useRef, useState } from "react";
import type { ProductDto } from "@/features/product/api/types";
import { CartAddedModal, useAddToCart } from "@/features/cart";
import { usePurchaseChoice } from "@/features/guest-order";
import { formatKrwPrice } from "@/shared/lib/format";
import Stars from "@/widgets/subscribe/plans/ui/reviews/Stars";
import ProductReviewList from "@/widgets/subscribe/plans/ui/reviews/ProductReviewList";
import ReviewImageLightbox from "@/widgets/subscribe/plans/ui/reviews/ReviewImageLightbox";
import { useProductReviews } from "@/widgets/subscribe/plans/ui/reviews/useProductReviews";
import ProductDeliveryInfo from "@/widgets/subscribe/plans/ui/detail/ProductDeliveryInfo";
import ProductSupportTab from "@/widgets/subscribe/plans/ui/detail/ProductSupportTab";
import IndependentProductInfoImages from "./IndependentProductInfoImages";

type TabKey = "info" | "review" | "delivery" | "support";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "info", label: "제품정보" },
  { key: "review", label: "제품리뷰" },
  { key: "delivery", label: "배송정보" },
  { key: "support", label: "고객센터" },
];

function tabLabel(tab: (typeof TABS)[number], reviewTotal: number) {
  return tab.key === "review" && reviewTotal > 0
    ? `${tab.label} ${reviewTotal.toLocaleString("ko-KR")}`
    : tab.label;
}

export default function IndependentProductDetailPage({ product }: { product: ProductDto }) {
  const { requestPurchase, purchaseChoiceModal } = usePurchaseChoice();
  const cartAction = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const reviews = useProductReviews(null, product.id);
  const unavailable = product.isSoldOut || product.isSalesPaused;
  const detailThumbnailUrl = product.detailThumbnailUrl ?? product.imageUrl;
  const discountRate = product.originalPrice !== null && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  function handleAddToCart() {
    if (!unavailable) void cartAction.add(product.id, quantity);
  }

  function handleBuy() {
    if (unavailable) return;
    requestPurchase({
      memberHref: `/purchase/order?productId=${product.id}&quantity=${quantity}`,
      guestHref: `/purchase/guest-order?productId=${product.id}&quantity=${quantity}`,
    });
  }

  function handleReviewCountClick() {
    setActiveTab("review");
    requestAnimationFrame(() => {
      tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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

  return (
    <main className="w-full pb-20 pt-[calc(var(--header-offset)+40px)]">
      {purchaseChoiceModal}
      {cartAction.cart && (
        <CartAddedModal
          cart={cartAction.cart}
          recommendations={cartAction.recommendations}
          pendingProductId={cartAction.pendingProductId}
          error={cartAction.error}
          onAdd={cartAction.add}
          onReplaceRecommendation={cartAction.replaceRecommendation}
          onClose={cartAction.close}
        />
      )}
      {reviews.lightbox && (
        <ReviewImageLightbox
          urls={reviews.lightbox.urls}
          index={reviews.lightbox.index}
          onClose={reviews.closeLightbox}
          onNavigate={reviews.navigateLightbox}
        />
      )}

      <div className="mx-auto w-full max-w-content px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-[20px] bg-[var(--color-surface-warm)]">
            {detailThumbnailUrl ? (
              <img
                src={detailThumbnailUrl}
                alt={`${product.name} 대표 이미지`}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[28px] font-extrabold text-[var(--color-text-emphasis)]">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-2">
              <Stars rating={product.averageRating} size={24} />
              <button
                type="button"
                onClick={handleReviewCountClick}
                className="text-body-14-r text-[var(--color-text-secondary)] underline decoration-[var(--color-text-secondary)]"
              >
                리뷰 {product.reviewCount}개
              </button>
            </div>
            {product.description && (
              <p className="mt-6 whitespace-pre-line text-body-14-r leading-6 text-[var(--color-text-secondary)]">
                {product.description}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-baseline gap-2">
              {discountRate !== null && (
                <>
                  <span className="text-body-16-b text-[var(--color-primary)]">{discountRate}%</span>
                  <span className="text-body-14-r text-[var(--color-text-tertiary)] line-through">
                    {formatKrwPrice(product.originalPrice!)}
                  </span>
                </>
              )}
              <strong className="text-price-20-eb">{formatKrwPrice(product.price)}</strong>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="h-10 w-10 rounded border border-[var(--color-border)]"
                aria-label="수량 감소"
              >
                −
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                className="h-10 w-10 rounded border border-[var(--color-border)]"
                aria-label="수량 증가"
              >
                +
              </button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={unavailable || cartAction.pendingProductId !== null}
                onClick={handleAddToCart}
                className="h-12 rounded-[8px] border border-[var(--color-cta-button)] font-semibold text-[var(--color-cta-button)] disabled:opacity-40"
              >
                장바구니
              </button>
              <button
                type="button"
                disabled={unavailable}
                onClick={handleBuy}
                className="h-12 rounded-[8px] bg-[var(--color-cta-button)] font-semibold text-white disabled:opacity-40"
              >
                {product.isSoldOut ? "품절" : product.isSalesPaused ? "판매 중지" : "구매하기"}
              </button>
            </div>
          </div>
        </div>

        <div
          ref={tabsRef}
          className="mt-16 scroll-mt-4 border-b border-[var(--color-text-muted)] pb-4 max-md:mt-10 max-md:pb-3"
          role="tablist"
          aria-label="상품 상세 정보"
        >
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center text-center">
            {TABS.map((tab, index) => {
              const isActive = activeTab === tab.key;
              return (
                <Fragment key={tab.key}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.key)}
                    className={
                      isActive
                        ? "max-md:text-body-13-sb md:text-body-16-sb text-[var(--color-text)]"
                        : "max-md:text-body-13-m md:text-body-16-m text-[var(--color-text-secondary)]"
                    }
                  >
                    {tabLabel(tab, reviews.tabTotal)}
                  </button>
                  {index < TABS.length - 1 && (
                    <span className="mx-2 h-3 w-px bg-[var(--color-text-secondary)] max-md:mx-1" />
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {activeTab === "info" && <IndependentProductInfoImages productName={product.name} />}

      {activeTab === "review" && (
        <>
          <div className="md:hidden">
            <ProductReviewList variant="mobile" {...reviewListProps} />
          </div>
          <div className="mx-auto w-full max-w-content max-md:hidden">
            <ProductReviewList variant="desktop" {...reviewListProps} />
          </div>
        </>
      )}

      {activeTab === "delivery" && (
        <>
          <div className="md:hidden">
            <ProductDeliveryInfo variant="mobile" />
          </div>
          <div className="max-md:hidden">
            <ProductDeliveryInfo variant="desktop" />
          </div>
        </>
      )}

      {activeTab === "support" && (
        <>
          <div className="md:hidden">
            <ProductSupportTab variant="mobile" />
          </div>
          <div className="mx-auto w-full max-w-content max-md:hidden">
            <ProductSupportTab variant="desktop" />
          </div>
        </>
      )}
    </main>
  );
}
