"use client";
/* eslint-disable @next/next/no-img-element -- 상품 썸네일은 서버의 동적 원격 URL이다. */

import { Fragment, useRef, useState } from "react";
import type { ProductDto } from "@/features/product/api/types";
import { CartAddedModal, formatManwon, useAddToCart } from "@/features/cart";
import { MEDIA_MD2_MIN } from "@/shared/config/breakpoints";
import { STANDARD_SHIPPING_FEE } from "@/shared/config/shipping";
import { formatKrwPrice } from "@/shared/lib/format";
import { useOrderPolicy } from "@/shared/lib/orderPolicy";
import Stars from "@/widgets/subscribe/plans/ui/reviews/Stars";
import ProductReviewList from "@/widgets/subscribe/plans/ui/reviews/ProductReviewList";
import ReviewImageLightbox from "@/widgets/subscribe/plans/ui/reviews/ReviewImageLightbox";
import { useProductReviews } from "@/widgets/subscribe/plans/ui/reviews/useProductReviews";
import ProductDeliveryInfo from "@/widgets/subscribe/plans/ui/detail/ProductDeliveryInfo";
import ProductSupportTab from "@/widgets/subscribe/plans/ui/detail/ProductSupportTab";
import IndependentProductInfoImages from "./IndependentProductInfoImages";
import PackageSheetHost from "../package/PackageSheetHost";

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

function QuantityIcon({ type }: { type: "minus" | "plus" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[var(--color-text)]">
      <circle cx="12" cy="12" r="9" fill="var(--color-text-muted)" fillOpacity="0.3" />
      <path d="M8 12H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {type === "plus" && <path d="M12 8V16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />}
    </svg>
  );
}

export default function IndependentProductDetailPage({ product }: { product: ProductDto }) {
  const cartAction = useAddToCart();
  // 바텀시트를 쓰는 크기(<950px, 단품몰과 같은 기준)에선 담기 후 모달 대신 내 패키지 바텀시트를 띄운다.
  const [showPackageSheet, setShowPackageSheet] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const reviews = useProductReviews(null, product.id);
  const orderPolicy = useOrderPolicy();
  const shippingFee = orderPolicy?.shippingFee ?? STANDARD_SHIPPING_FEE;
  const freeShippingThreshold = orderPolicy?.freeShippingThreshold ?? 0;
  const unavailable = product.isSoldOut || product.isSalesPaused;
  const detailThumbnailUrl = product.detailThumbnailUrl ?? product.imageUrl;
  const discountRate = product.originalPrice !== null && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  function handleAddToCart() {
    if (unavailable) return;
    setShowPackageSheet(!window.matchMedia(MEDIA_MD2_MIN).matches);
    void cartAction.add(product.id, quantity);
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
      {cartAction.cart && showPackageSheet && <PackageSheetHost initialCart={cartAction.cart} onMore={cartAction.close} />}
      {cartAction.cart && !showPackageSheet && (
        <CartAddedModal
          cart={cartAction.cart}
          policy={cartAction.policy}
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
        <div className="grid gap-8 lg:mx-auto lg:w-[1013px] lg:grid-cols-[507px_438px] lg:justify-between lg:gap-0">
          <div className="mx-auto w-full min-w-0 max-w-[507px] lg:mx-0">
            <div className="aspect-square overflow-hidden rounded-[20px] bg-[var(--color-surface-warm)]">
              {detailThumbnailUrl ? (
                <img
                  src={detailThumbnailUrl}
                  alt={`${product.name} 대표 이미지`}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <p className="mt-2 text-center font-medium leading-[14px] text-[var(--color-text-caption)] max-md:text-[10px] md:text-[12px]">
              ※ 본 이미지는 연출된 이미지로 실제 구성 및 형태와 다소 차이가 있을 수 있습니다.
            </p>
          </div>

          <div className="mx-auto w-full min-w-0 max-w-[438px] lg:mx-0 lg:pt-9">
            <h1 className="font-extrabold tracking-[-0.04em] text-[var(--color-text-emphasis)] max-md:text-[24px] max-md:leading-[29px] md:text-[28px] md:leading-[33px]">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <Stars rating={product.averageRating} size={24} />
              {product.averageRating > 0 && (
                <span className="text-[18px] font-semibold leading-[21px] tracking-[-0.02em] text-[var(--color-text)]">
                  {product.averageRating.toFixed(1)}
                </span>
              )}
              <button
                type="button"
                onClick={handleReviewCountClick}
                className="text-[14px] font-normal leading-[150%] tracking-[-0.02em] text-[var(--color-text-tertiary)] underline decoration-[var(--color-text-tertiary)]"
              >
                {product.reviewCount}개 리뷰
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-[var(--color-text-muted)] pb-4 pl-1">
              {discountRate !== null && (
                <span className="text-[20px] font-bold leading-6 tracking-[-0.05em] text-[var(--color-primary)]">
                  {discountRate}%
                </span>
              )}
              <span className="flex items-center gap-3">
                {discountRate !== null && (
                  <del className="text-[16px] font-medium leading-[19px] tracking-[-0.05em] text-[var(--color-text-secondary)]">
                    <span className="sr-only">정가 </span>
                    {formatKrwPrice(product.originalPrice!)}
                  </del>
                )}
                <strong className="text-[20px] font-extrabold leading-[32px] tracking-[-0.05em] text-[var(--color-text-price)]">
                  {formatKrwPrice(product.price)}
                </strong>
              </span>
            </div>

            <dl className="space-y-4 pt-6">
              <div className="grid grid-cols-[85px_minmax(0,1fr)] items-start">
                <dt className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">배송방법</dt>
                <dd>
                  <p className="text-body-13-m text-[var(--color-text)]">우체국택배</p>
                  <p className="mt-2 text-body-13-m text-[var(--color-text-secondary)]">
                    월~목 배송 / 오전 10시 이전 주문 시 당일발송
                  </p>
                </dd>
              </div>
              <div className="grid grid-cols-[85px_minmax(0,1fr)] items-center">
                <dt className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">배송비</dt>
                <dd className="flex flex-wrap items-center gap-2 text-[13px] font-medium leading-4">
                  <span className="text-[var(--color-text)]">{formatKrwPrice(shippingFee)}</span>
                  {freeShippingThreshold > 0 && (
                    <span className="text-[var(--color-text-secondary)]">
                      {formatManwon(freeShippingThreshold)} 이상 무료배송
                    </span>
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-[85px_minmax(0,1fr)] items-center">
                <dt className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">제품수량</dt>
                <dd>
                  <div className="inline-flex h-[34px] items-center gap-3 rounded-[5px] border border-[var(--color-text-muted)] bg-white px-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      disabled={quantity <= 1}
                      className="flex h-6 w-6 items-center justify-center disabled:opacity-30"
                      aria-label="수량 감소"
                    >
                      <QuantityIcon type="minus" />
                    </button>
                    <span className="min-w-3 text-center text-[12px] font-medium leading-[14px] tracking-[-0.02em] text-black">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                      disabled={quantity >= 99}
                      className="flex h-6 w-6 items-center justify-center disabled:opacity-30"
                      aria-label="수량 증가"
                    >
                      <QuantityIcon type="plus" />
                    </button>
                  </div>
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex items-center justify-between border-t border-[var(--color-text-muted)] pt-5">
              <span className="text-[20px] font-bold leading-6 tracking-[-0.05em] text-[var(--color-surface-dark)]">
                총 합계
              </span>
              <span className="text-[20px] font-extrabold leading-6 tracking-[-0.05em] text-[var(--color-surface-dark)]">
                {formatKrwPrice(product.price * quantity)}
              </span>
            </div>

            <button
              type="button"
              disabled={unavailable || cartAction.pendingProductId !== null}
              onClick={handleAddToCart}
              className="mt-9 flex h-12 w-full items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] text-body-16-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40"
            >
              {product.isSoldOut ? "품절" : product.isSalesPaused ? "판매 중지" : "패키지에 담기"}
            </button>
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
