"use client";

import { Fragment, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { MEDIA_MAX_MD_SIZES } from "@/shared/config/breakpoints";
import { formatKrwPrice } from "@/shared/lib/format";
import { ChevronIcon } from "@/shared/ui";
import {
  TIER_BOX_IMAGES,
  TIER_LABEL,
  formatPackageContentsLabel,
  type PackageData,
  type PackagePurchaseProduct,
} from "@/entities/package";
import Stars from "@/widgets/subscribe/plans/ui/reviews/Stars";
import ReviewImageLightbox from "@/widgets/subscribe/plans/ui/reviews/ReviewImageLightbox";
import { useProductReviews } from "@/widgets/subscribe/plans/ui/reviews/useProductReviews";
import ProductReviewList from "@/widgets/subscribe/plans/ui/reviews/ProductReviewList";
import ProductInfoImages from "@/widgets/subscribe/plans/ui/detail/ProductInfoImages";
import ProductDeliveryInfo from "@/widgets/subscribe/plans/ui/detail/ProductDeliveryInfo";
import ProductSupportTab from "@/widgets/subscribe/plans/ui/detail/ProductSupportTab";
import purchaseDetail02 from "./assets/purchase-detail-02.webp";
import purchaseDetail03 from "./assets/purchase-detail-03.webp";
import purchaseDetail04 from "./assets/purchase-detail-04.webp";
import purchaseDetail05 from "./assets/purchase-detail-05.webp";
import purchaseDetail06 from "./assets/purchase-detail-06.webp";
import purchaseDetail07 from "./assets/purchase-detail-07.webp";
import purchaseDetail08 from "./assets/purchase-detail-08.webp";

interface Props {
  pkg: PackageData;
  purchaseProduct: PackagePurchaseProduct;
  /** 리뷰 조회용 — 백엔드 카탈로그 매칭 전이면 null(평점·리뷰 UI 숨김) */
  relatedPlanId: number | null;
}

const DETAIL_IMAGES = [
  purchaseDetail02,
  purchaseDetail03,
  purchaseDetail04,
  purchaseDetail05,
  purchaseDetail06,
  purchaseDetail07,
  purchaseDetail08,
] as const;

type TabKey = "info" | "review" | "delivery" | "support";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "info", label: "제품정보" },
  { key: "review", label: "제품리뷰" },
  { key: "delivery", label: "배송정보" },
  { key: "support", label: "고객센터" },
];

/** 이미지 좌우 장식용 화살표 — 상품이 1종뿐이라 비활성(PurchaseListSection 하단 페이지네이션과 동일 패턴) */
function DecorativeImageArrows() {
  return (
    <>
      <span
        aria-hidden
        className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 opacity-30"
      >
        <span className="rotate-90 inline-flex">
          <ChevronIcon open={false} size={16} />
        </span>
      </span>
      <span
        aria-hidden
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 opacity-30"
      >
        <span className="-rotate-90 inline-flex">
          <ChevronIcon open={false} size={16} />
        </span>
      </span>
    </>
  );
}

export default function PurchaseProductDetailPage({ pkg, purchaseProduct, relatedPlanId }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const mobileTabsRef = useRef<HTMLDivElement | null>(null);
  const desktopTabsRef = useRef<HTMLDivElement | null>(null);

  const reviewState = useProductReviews(relatedPlanId ?? 0);
  const hasReviews = relatedPlanId !== null;

  function handleReviewCountClick() {
    setActiveTab("review");
    requestAnimationFrame(() => {
      const target =
        mobileTabsRef.current?.offsetParent !== null ? mobileTabsRef.current : desktopTabsRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const contentsLabel = formatPackageContentsLabel(pkg.contents);
  const total = purchaseProduct.price * quantity;
  const selectedTheme = { tierLabel: TIER_LABEL[pkg.tier], colorVar: pkg.colorVar };

  function handleBuy() {
    router.push(`/purchase/order?tier=${pkg.tier}&quantity=${quantity}`);
  }

  const TopBar = (
    <div className="flex h-[46px] w-full min-w-0 items-center gap-2 px-4 sm:gap-3 sm:px-6 md:px-0">
      <span className="shrink-0 text-body-12-m text-[var(--color-text-muted)] sm:text-body-14-sb">
        단품 구매
      </span>
      <span className="h-3 w-px shrink-0 bg-white/30" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-body-12-m text-white sm:text-body-14-sb">
        {contentsLabel}
      </span>
      <span className="h-3 w-px shrink-0 bg-white/30" aria-hidden />
      <span className="shrink-0 text-body-12-sb text-white sm:text-body-14-sb">
        {formatKrwPrice(purchaseProduct.price)}
      </span>
    </div>
  );

  return (
    <section className="flex min-h-full flex-1 flex-col pt-[var(--header-offset)] md:pb-16 lg:pb-16">
      {reviewState.lightbox ? (
        <ReviewImageLightbox
          urls={reviewState.lightbox.urls}
          index={reviewState.lightbox.index}
          onClose={reviewState.closeLightbox}
          onNavigate={reviewState.navigateLightbox}
        />
      ) : null}

      {/* Mobile layout */}
      <div className="md:hidden lg:hidden">
        <div className="mb-6 w-full" style={{ background: "var(--color-top-band-bg)" }}>
          {TopBar}
        </div>

        <div className="px-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-[var(--color-surface-warm)]">
            <Image
              src={TIER_BOX_IMAGES[pkg.tier]}
              alt={`${pkg.name} 대표 이미지`}
              fill
              sizes={`${MEDIA_MAX_MD_SIZES} 100vw, 508px`}
              quality={HIGH_IMAGE_QUALITY}
              className="object-cover"
              priority
            />
            <DecorativeImageArrows />
          </div>
          <p className="mt-2 text-center text-[10px] font-medium leading-[14px] text-[var(--color-text-caption)]">
            ※ 본 이미지는 연출된 이미지로 실제 구성 및 형태와 다소 차이가 있을 수 있습니다.
          </p>

          <h2 className="mt-[30px] text-[24px] font-bold leading-[29px] tracking-[-0.04em] text-[var(--color-text-emphasis)]">
            {pkg.name}
          </h2>

          {hasReviews && (
            <div className="mt-3 flex items-center gap-2">
              <Stars rating={reviewState.average} size={24} />
              {reviewState.average > 0 && (
                <span className="text-[18px] font-semibold leading-[21px] tracking-[-0.02em] text-[var(--color-text)]">
                  {reviewState.average.toFixed(1)}
                </span>
              )}
              <button
                type="button"
                onClick={handleReviewCountClick}
                className="text-[14px] font-normal leading-[150%] tracking-[-0.02em] text-[var(--color-text-tertiary)] underline decoration-[var(--color-text-tertiary)]"
              >
                {reviewState.total}개 리뷰
              </button>
            </div>
          )}

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-body-16-b text-[var(--color-text-body-warm)]">단품 구매</span>
            <span className="text-price-20-eb text-[var(--color-text-emphasis)]">
              {formatKrwPrice(purchaseProduct.price)}
            </span>
          </div>

          <div className="mt-6 border-t border-[var(--color-text-muted)] px-1.5 pt-6">
            <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">제품구성</span>
              <span
                className="max-w-[220px] text-left text-[14px] font-bold leading-[17px]"
                style={{ color: selectedTheme.colorVar }}
              >
                {contentsLabel}
              </span>
            </div>

            <div className="mt-[26px] grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">배송방법</span>
              <div>
                <p className="text-[13px] font-medium leading-[140%] text-[var(--color-text)]">우체국택배</p>
                <p className="mt-2 text-[13px] font-normal leading-[140%] text-[var(--color-text-secondary)]">
                  월~목 배송
                  <br />
                  오전 11시 이후 주문 시 익일 발송
                </p>
              </div>
            </div>

            <div className="mt-[22px] grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">배송비</span>
              <span className="text-[13px] font-medium leading-[140%] text-[var(--color-text)]">무료</span>
            </div>

            <div className="mt-[22px] grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">제품수량</span>
              <div className="flex h-[34px] w-[102px] items-center justify-between rounded-[5px] border border-[var(--color-text-muted)] bg-white px-3">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-text-muted)]/30 text-[14px] font-medium text-black disabled:opacity-30"
                  aria-label="수량 감소"
                >
                  -
                </button>
                <span className="text-[12px] font-medium leading-[14px] tracking-[-0.02em] text-black">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
                  disabled={quantity >= 99}
                  className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-text-muted)]/30 text-[14px] font-medium text-black disabled:opacity-30"
                  aria-label="수량 증가"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--color-text-muted)] pt-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[20px] font-extrabold leading-8 tracking-[-0.05em] text-[var(--color-surface-dark)]">
                총 합계
              </span>
              <span className="text-[20px] font-extrabold leading-8 tracking-[-0.05em] text-[var(--color-surface-dark)]">
                {formatKrwPrice(total)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleBuy}
              className="flex h-12 w-full items-center justify-center rounded-[8px] text-body-16-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80"
              style={{ background: "var(--color-cta-button)" }}
            >
              구매하기
            </button>
          </div>

          <div ref={mobileTabsRef} className="mt-6 scroll-mt-4 border-b border-[var(--color-text-muted)] pb-3">
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center text-center">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.key;
                return (
                  <Fragment key={tab.key}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={
                        isActive
                          ? "text-body-13-sb text-[var(--color-text)]"
                          : "text-body-13-m text-[var(--color-text-secondary)]"
                      }
                    >
                      {tab.label}
                    </button>
                    {idx < TABS.length - 1 && <span className="mx-1 h-3 w-px bg-[var(--color-text-secondary)]" />}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {activeTab === "info" && (
          <ProductInfoImages
            variant="mobile"
            images={DETAIL_IMAGES}
            planName={pkg.name}
            tier={pkg.tier}
            hideDisclaimer
          />
        )}

        {activeTab === "review" && (
          <ProductReviewList
            variant="mobile"
            selectedTheme={selectedTheme}
            reviews={reviewState.reviews}
            loading={reviewState.loading}
            reviewImages={reviewState.reviewImages}
            page={reviewState.page}
            totalPages={reviewState.totalPages}
            sort={reviewState.sort}
            onChangeSort={reviewState.changeSort}
            onChangePage={reviewState.setPage}
            onOpenLightbox={reviewState.openLightbox}
          />
        )}

        {activeTab === "delivery" && <ProductDeliveryInfo variant="mobile" />}

        {activeTab === "support" && <ProductSupportTab variant="mobile" />}
      </div>

      {/* Desktop layout */}
      <div className="max-md:hidden">
        <div className="mb-[44px] w-full" style={{ background: "var(--color-top-band-bg)" }}>
          <div className="mx-auto w-full max-w-[var(--max-width-content)] md:px-6 lg:px-0">{TopBar}</div>
        </div>

        <div className="mx-auto w-full max-w-[var(--max-width-content)]">
          <div className="grid gap-8 lg:mx-auto lg:w-[1013px] lg:grid-cols-[508px_438px] lg:justify-between lg:gap-0">
            <div className="mx-auto min-w-0 w-full max-w-[508px] lg:mx-0">
              <div className="relative h-[508px] overflow-hidden rounded-[20px] bg-[var(--color-surface-warm)]">
                <Image
                  src={TIER_BOX_IMAGES[pkg.tier]}
                  alt={`${pkg.name} 대표 이미지`}
                  fill
                  sizes="508px"
                  quality={HIGH_IMAGE_QUALITY}
                  className="object-cover"
                  priority
                />
                <DecorativeImageArrows />
              </div>
              <p className="mt-2 text-center text-[12px] font-medium leading-[14px] text-[var(--color-text-caption)]">
                ※ 본 이미지는 연출된 이미지로 실제 구성 및 형태와 다소 차이가 있을 수 있습니다.
              </p>
            </div>

            <div className="mx-auto min-w-0 w-full max-w-[438px] lg:mx-0">
              <h2 className="mb-2 text-[28px] font-extrabold tracking-[-0.04em] text-[var(--color-text-emphasis)]">
                {pkg.name}
              </h2>
              {hasReviews && (
                <div className="mb-4 flex items-center gap-3">
                  <Stars rating={reviewState.average} size={24} />
                  {reviewState.average > 0 && (
                    <span className="text-[18px] font-semibold leading-[21px] tracking-[-0.02em] text-[var(--color-text)]">
                      {reviewState.average.toFixed(1)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleReviewCountClick}
                    className="text-[14px] font-normal leading-[150%] tracking-[-0.02em] text-[var(--color-text-tertiary)] underline decoration-[var(--color-text-tertiary)]"
                  >
                    {reviewState.total}개 리뷰
                  </button>
                </div>
              )}
              <div className="mb-5 flex items-baseline gap-2">
                <span className="text-body-16-b text-[var(--color-text-body-warm)]">단품 구매</span>
                <span className="text-price-20-eb text-[var(--color-text-emphasis)]">
                  {formatKrwPrice(purchaseProduct.price)}
                </span>
              </div>
              <div className="mb-8 border-t border-[var(--color-text-muted)] px-2 pt-7">
                <div className="space-y-4">
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-4 text-body-14-m md:gap-x-9 lg:gap-x-9">
                    <span className="leading-[1.1] text-[var(--color-text)]">제품구성</span>
                    <span
                      className="justify-self-start max-w-[240px] text-left text-body-14-b leading-[17px]"
                      style={{ color: selectedTheme.colorVar }}
                    >
                      {contentsLabel}
                    </span>
                  </div>
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-4 text-body-14-m md:gap-x-9 lg:gap-x-9">
                    <span className="leading-[1.1] text-[var(--color-text)]">배송방법</span>
                    <div className="justify-self-start max-w-[240px] text-left">
                      <p className="text-body-13-m leading-[140%] text-[var(--color-text)]">우체국택배</p>
                      <p className="mt-2 text-body-13-r leading-[140%] text-[var(--color-text-secondary)]">
                        월~목 배송 / 오전 11시 이후 주문 시 익일 발송
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-4 text-body-14-m md:gap-x-9 lg:gap-x-9">
                    <span className="leading-[1.1] text-[var(--color-text)]">배송비</span>
                    <span className="justify-self-start text-body-13-m leading-[140%] text-[var(--color-text)]">무료</span>
                  </div>
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-4 text-body-14-m md:gap-x-9 lg:gap-x-9">
                    <span className="leading-[1.1] text-[var(--color-text)]">제품수량</span>
                    <div className="justify-self-start flex h-[34px] items-center gap-3 rounded-[5px] border border-[var(--color-text-muted)] px-3">
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        disabled={quantity <= 1}
                        className="h-6 w-6 rounded bg-[rgba(221,221,221,0.3)] text-body-13-sb disabled:opacity-30"
                        aria-label="수량 감소"
                      >
                        -
                      </button>
                      <span className="min-w-3 text-center text-[12px] font-medium leading-[14px]">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
                        disabled={quantity >= 99}
                        className="h-6 w-6 rounded bg-[rgba(221,221,221,0.3)] text-body-13-sb disabled:opacity-30"
                        aria-label="수량 증가"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-[var(--color-text-muted)] pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[20px] font-extrabold leading-8 tracking-[-0.05em] text-[var(--color-text)]">
                    총 합계
                  </span>
                  <span className="text-[20px] font-extrabold leading-8 tracking-[-0.05em] text-[var(--color-text)]">
                    {formatKrwPrice(total)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleBuy}
                  className="flex h-[48px] w-full items-center justify-center rounded-[8px] text-body-16-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 md:mt-8 lg:mt-8"
                  style={{ background: "var(--color-cta-button)" }}
                >
                  구매하기
                </button>
              </div>
            </div>
          </div>

          <div ref={desktopTabsRef} className="scroll-mt-4 border-b border-[var(--color-text-muted)] pb-4 md:mt-8 lg:mt-8">
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center text-center">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.key;
                return (
                  <Fragment key={tab.key}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={
                        isActive
                          ? "text-body-16-sb text-[var(--color-text)]"
                          : "text-body-16-m text-[var(--color-text-secondary)]"
                      }
                    >
                      {tab.label}
                    </button>
                    {idx < TABS.length - 1 && <span className="mx-2 h-3 w-px bg-[var(--color-text-secondary)]" />}
                  </Fragment>
                );
              })}
            </div>
          </div>

          {activeTab === "info" && (
            <ProductInfoImages
              variant="desktop"
              images={DETAIL_IMAGES}
              planName={pkg.name}
              tier={pkg.tier}
              hideDisclaimer
            />
          )}

          {activeTab === "review" && (
            <ProductReviewList
              variant="desktop"
              selectedTheme={selectedTheme}
              reviews={reviewState.reviews}
              loading={reviewState.loading}
              reviewImages={reviewState.reviewImages}
              page={reviewState.page}
              totalPages={reviewState.totalPages}
              sort={reviewState.sort}
              onChangeSort={reviewState.changeSort}
              onChangePage={reviewState.setPage}
              onOpenLightbox={reviewState.openLightbox}
            />
          )}

          {activeTab === "delivery" && <ProductDeliveryInfo variant="desktop" />}

          {activeTab === "support" && <ProductSupportTab variant="desktop" />}
        </div>
      </div>
    </section>
  );
}
