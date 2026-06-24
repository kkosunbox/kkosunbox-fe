"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import subscribeItem01A from "@/widgets/subscribe/plans/assets/subscribe-item-01-A.webp";
import subscribeItem01B from "@/widgets/subscribe/plans/assets/subscribe-item-01-B.webp";
import subscribeItem01BB from "@/widgets/subscribe/plans/assets/subscribe-item-01-BB.webp";
import subscribeItem01C from "@/widgets/subscribe/plans/assets/subscribe-item-01-C.webp";
import subscribeItem01D from "@/widgets/subscribe/plans/assets/subscribe-item-01-D.webp";
import subscribeItem02A from "@/widgets/subscribe/plans/assets/subscribe-item-02-A.webp";
import subscribeItem02B from "@/widgets/subscribe/plans/assets/subscribe-item-02-B.webp";
import subscribeItem02BB from "@/widgets/subscribe/plans/assets/subscribe-item-02-BB.webp";
import subscribeItem02C from "@/widgets/subscribe/plans/assets/subscribe-item-02-C.webp";
import subscribeItem02D from "@/widgets/subscribe/plans/assets/subscribe-item-02-D.webp";
import subscribeItem03A from "@/widgets/subscribe/plans/assets/subscribe-item-03-A.webp";
import subscribeItem03B from "@/widgets/subscribe/plans/assets/subscribe-item-03-B.webp";
import subscribeItem03BB from "@/widgets/subscribe/plans/assets/subscribe-item-03-BB.webp";
import subscribeItem03C from "@/widgets/subscribe/plans/assets/subscribe-item-03-C.webp";
import subscribeItem03D from "@/widgets/subscribe/plans/assets/subscribe-item-03-D.webp";
import {
  TIER_DETAIL_HERO_IMAGES,
  comparePlansForDisplayOrder,
  packageThemeForPlan,
  PACKAGES,
  tierFromSubscriptionPlan,
  type PackageTier,
} from "@/entities/package";
import type { SubscriptionPlanDto, SubscriptionPlanTagDto } from "@/features/subscription/api/types";
import { useReferralPricing } from "@/features/referral/model";
import { ReferralAdditionalDiscountChip } from "@/features/referral/ui";
import { MEDIA_MAX_MD_SIZES } from "@/shared/config/breakpoints";
import Stars from "./reviews/Stars";
import ReviewImageLightbox from "./reviews/ReviewImageLightbox";
import { useProductReviews } from "./reviews/useProductReviews";
import ProductReviewList from "./reviews/ProductReviewList";
import ProductInfoImages from "./detail/ProductInfoImages";
import ProductDeliveryInfo from "./detail/ProductDeliveryInfo";
import ProductSupportTab from "./detail/ProductSupportTab";

interface Props {
  initialPlan: SubscriptionPlanDto;
  plans: SubscriptionPlanDto[];
}

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function PlanImageBadges({
  tags,
  className,
}: {
  tags: SubscriptionPlanTagDto[] | null | undefined;
  className: string;
}) {
  const visibleTags = (tags ?? []).filter((tag) => tag.name.trim().length > 0);
  if (visibleTags.length === 0) return null;

  return (
    <div className={className}>
      {visibleTags.map((tag) => (
        <span
          key={tag.id}
          className="rounded-[5px] px-1.5 py-1 text-[12px] font-semibold leading-[14px]"
          style={{ background: tag.bgColor, color: tag.textColor }}
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}

const DETAIL_ASSET_IMAGES: Record<
  PackageTier,
  readonly [StaticImageData, StaticImageData, StaticImageData, StaticImageData, StaticImageData]
> = {
  Premium: [subscribeItem01A, subscribeItem01B, subscribeItem01BB, subscribeItem01C, subscribeItem01D],
  Standard: [subscribeItem02A, subscribeItem02B, subscribeItem02BB, subscribeItem02C, subscribeItem02D],
  Basic: [subscribeItem03A, subscribeItem03B, subscribeItem03BB, subscribeItem03C, subscribeItem03D],
};

type TabKey = "info" | "review" | "delivery" | "support";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "info", label: "구독정보" },
  { key: "review", label: "구독리뷰" },
  { key: "delivery", label: "배송정보" },
  { key: "support", label: "고객센터" },
];

export default function SubscribeProductDetailPage({ initialPlan, plans }: Props) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const mobileTabsRef = useRef<HTMLDivElement | null>(null);
  const desktopTabsRef = useRef<HTMLDivElement | null>(null);

  const reviewState = useProductReviews(selectedPlan.id);

  function handleReviewCountClick() {
    setActiveTab("review");
    requestAnimationFrame(() => {
      const target =
        mobileTabsRef.current?.offsetParent !== null
          ? mobileTabsRef.current
          : desktopTabsRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const sortedPlans = useMemo(() => [...plans].sort(comparePlansForDisplayOrder), [plans]);

  const selectedTheme = packageThemeForPlan(selectedPlan);
  const selectedTier = tierFromSubscriptionPlan(selectedPlan);
  const selectedPackage = PACKAGES.find((pkg) => pkg.tier === selectedTier) ?? PACKAGES[0];
  const detailImages = DETAIL_ASSET_IMAGES[selectedTier];
  const packageThumbnail = TIER_DETAIL_HERO_IMAGES[selectedTier];

  const { referralPrice, additionalDiscountPct, inviteEligible } = useReferralPricing();

  const originalPrice = selectedPlan.originalPrice;
  const discountedUnitPrice = inviteEligible
    ? referralPrice(selectedPlan.monthlyPrice)
    : selectedPlan.monthlyPrice;
  const hasDiscount = inviteEligible || selectedPlan.discountRate > 0;
  const salePrice = discountedUnitPrice * quantity;

  function handleSelectPlan(plan: SubscriptionPlanDto) {
    setSelectedPlan(plan);
    setQuantity(1);
    reviewState.setPage(1);
    router.replace(`/subscribe/detail?planId=${plan.id}`, { scroll: false });
  }

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
      {/* Mobile layout (Figma-aligned) */}
      <div className="md:hidden lg:hidden">
        <div className="mb-3 w-full" style={{ background: "var(--color-why-bg)" }}>
          <div className="flex h-[46px] w-full min-w-0 items-center max-sm:gap-2 max-sm:px-4 sm:gap-3 sm:px-6">
            <span className="max-sm:mr-1 max-sm:shrink-0 max-sm:text-body-12-m sm:mr-2 sm:shrink-0 sm:text-body-14-sb text-[var(--color-text-muted)]">
              구독선택
            </span>
            <div
              className="flex min-w-0 flex-1 gap-1.5 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:[-ms-overflow-style:none] max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden sm:flex-wrap sm:gap-2"
              role="tablist"
              aria-label="구독 플랜 선택"
            >
              {sortedPlans.map((plan) => {
                const theme = packageThemeForPlan(plan);
                const isActive = selectedPlan.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelectPlan(plan)}
                    className="max-sm:h-[22px] max-sm:shrink-0 max-sm:rounded-full max-sm:px-2 max-sm:text-body-12-m sm:h-[24px] sm:shrink-0 sm:rounded-full sm:px-3 sm:text-body-14-sb text-white transition-opacity hover:opacity-90"
                    style={{
                      background: isActive ? theme.colorVar : "var(--color-plan-chip-inactive)",
                    }}
                  >
                    {theme.tierLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-[var(--color-surface-warm)]">
            <Image
              src={packageThumbnail}
              alt={`${selectedPlan.name} 대표 이미지`}
              fill
              sizes={`${MEDIA_MAX_MD_SIZES} 100vw, 508px`}
              className="object-cover"
              priority
            />
            <PlanImageBadges
              tags={selectedPlan.tags}
              className="absolute right-3 top-3 z-10 flex items-center gap-1.5"
            />
            {inviteEligible ? (
              <ReferralAdditionalDiscountChip
                pct={additionalDiscountPct}
                className="left-3 top-3"
              />
            ) : null}
          </div>
          <p className="mt-2 text-center text-[12px] font-medium leading-[14px] text-[var(--color-text-caption)]">
            ※ 본 이미지는 연출된 이미지로 실제 구성 및 형태와 다소 차이가 있을 수 있습니다.
          </p>

          <h2 className="mt-[30px] text-[24px] font-bold leading-[29px] tracking-[-0.04em] text-[var(--color-text-emphasis)] capitalize">
            {selectedPlan.name}
          </h2>

          <div className="mt-[12px] flex items-center gap-2">
            <span className="text-[20px] font-bold leading-6 tracking-[-0.05em] text-[var(--color-surface-dark)]">
              월 요금제
            </span>
            {hasDiscount && (
              <span className="text-[16px] font-semibold leading-8 tracking-[-0.05em] text-[var(--color-text-secondary)] line-through">
                {formatWon(originalPrice)}
              </span>
            )}
            <span className="text-[20px] font-extrabold leading-8 tracking-[-0.05em] text-[var(--color-surface-dark)]">
              {formatWon(discountedUnitPrice)}
            </span>
          </div>

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

          <div className="mt-6 border-t border-[var(--color-text-muted)] pt-6 px-1.5">
            <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">제품구성</span>
              <span
                className="max-w-[220px] text-left text-[14px] font-bold leading-[17px]"
                style={{ color: selectedTheme.colorVar }}
              >
                {selectedPackage.contents.join(" ")}
              </span>
            </div>

            <div className="mt-[26px] grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">배송방법</span>
              <div>
                <p className="text-[13px] font-medium leading-[140%] text-[var(--color-text)]">
                  우체국택배
                </p>
                <p className="mt-2 text-[13px] font-normal leading-[140%] text-[var(--color-text-secondary)]">
                  월~목 배송 / 오전 11시 이후 주문 시 익일 발송
                </p>
              </div>
            </div>

            <div className="mt-[22px] grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">제품수량</span>
              <div className="flex h-[34px] w-[102px] items-center justify-between rounded-[5px] border border-[var(--color-text-muted)] bg-white px-3">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-text-muted)]/30 text-[14px] font-medium text-black"
                  aria-label="수량 감소"
                >
                  -
                </button>
                <span className="text-[12px] font-medium leading-[14px] tracking-[-0.02em] text-black">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-text-muted)]/30 text-[14px] font-medium text-black"
                  aria-label="수량 증가"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--color-text-muted)] pt-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[20px] font-extrabold leading-8 tracking-[-0.05em] text-[var(--color-surface-dark)] capitalize">
                총 합계
              </span>
              <span className="text-[20px] font-extrabold leading-8 tracking-[-0.05em] text-[var(--color-surface-dark)] capitalize">
                {formatWon(salePrice)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/order?planId=${selectedPlan.id}&quantity=${quantity}`)}
              className="flex h-12 w-full items-center justify-center rounded-[8px] text-subtitle-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80"
              style={{ background: "var(--color-why-bg)" }}
            >
              구독하기
            </button>
          </div>

          <div
            ref={mobileTabsRef}
            className="mt-6 scroll-mt-4 border-b border-[var(--color-text-muted)] pb-3"
          >
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
                    {idx < TABS.length - 1 && (
                      <span className="mx-1 h-3 w-px bg-[var(--color-text-secondary)]" />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {activeTab === "info" && (
          <ProductInfoImages
            variant="mobile"
            images={detailImages}
            planName={selectedPlan.name}
            tier={selectedTier}
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
        {/* Plan selector — full-width dark tab bar */}
        <div className="mb-[44px] w-full" style={{ background: "var(--color-why-bg)" }}>
          <div className="mx-auto flex h-[46px] w-full max-w-[var(--max-width-content)] items-center gap-3 md:px-6 lg:px-0">
            <span className="text-body-14-sb text-[var(--color-text-muted)] mr-6">구독선택</span>
            <div className="flex flex-wrap gap-2">
              {sortedPlans.map((plan) => {
                const theme = packageThemeForPlan(plan);
                const isActive = selectedPlan.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className="rounded-full px-3 h-[24px] text-body-14-sb text-white transition-opacity hover:opacity-90"
                    style={{
                      background: isActive ? theme.colorVar : "var(--color-plan-chip-inactive)",
                    }}
                  >
                    {theme.tierLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[var(--max-width-content)]">

          <div className="grid gap-8 lg:mx-auto lg:w-[1013px] lg:grid-cols-[508px_438px] lg:justify-between lg:gap-0">
            <div className="mx-auto min-w-0 w-full max-w-[508px] lg:mx-0">
              <div className="relative h-[508px] overflow-hidden rounded-[20px] bg-[var(--color-surface-warm)]">
                <Image
                  src={packageThumbnail}
                  alt={`${selectedPlan.name} 대표 이미지`}
                  fill
                  sizes="508px"
                  className="object-cover"
                  priority
                />
                <PlanImageBadges
                  tags={selectedPlan.tags}
                  className="absolute right-4 top-4 z-10 flex items-center gap-2"
                />
                {inviteEligible ? (
                  <ReferralAdditionalDiscountChip
                    pct={additionalDiscountPct}
                    className="left-4 top-4"
                  />
                ) : null}
              </div>
              <p className="mt-2 text-center text-[12px] font-medium leading-[14px] text-[var(--color-text-caption)]">
                ※ 본 이미지는 연출된 이미지로 실제 구성 및 형태와 다소 차이가 있을 수 있습니다.
              </p>
            </div>

            <div className="mx-auto min-w-0 w-full max-w-[438px] lg:mx-0">
              <h2 className="mb-2 text-[28px] font-extrabold tracking-[-0.04em] text-[var(--color-text-emphasis)]">
                {selectedPlan.name}
              </h2>
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
              <div className="mb-5 flex items-center gap-2">
                <span className="text-body-20-sb tracking-[-0.05em] text-[var(--color-surface-dark)]">
                  월 요금제
                </span>
                {hasDiscount && (
                  <span className="text-[16px] font-semibold leading-8 tracking-[-0.05em] text-[var(--color-text-secondary)] line-through">
                    {formatWon(originalPrice)}
                  </span>
                )}
                <span className="text-[20px] font-extrabold leading-8 tracking-[-0.05em] text-[var(--color-surface-dark)]">
                  {formatWon(discountedUnitPrice)}
                </span>
              </div>
              <div className="mb-8 border-t border-[var(--color-text-muted)] pt-7 px-2">
                <div className="space-y-6 md:space-y-8 lg:space-y-8">
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-4 md:gap-x-9 lg:gap-x-9 text-body-14-m">
                    <span className="text-[var(--color-text)] leading-[1.1]">제품구성</span>
                    <span className="justify-self-start max-w-[240px] text-left text-body-14-b leading-[17px]" style={{ color: selectedTheme.colorVar }}>
                      {selectedPackage.contents.join(" ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-4 md:gap-x-9 lg:gap-x-9 text-body-14-m">
                    <span className="text-[var(--color-text)] leading-[1.1]">배송방법</span>
                    <div className="justify-self-start max-w-[240px] text-left">
                      <p className="text-body-13-m leading-[140%] text-[var(--color-text)]">우체국택배</p>
                      <p className="text-body-13-r leading-[140%] text-[var(--color-text-secondary)] mt-2">
                        월~목 배송 / 오전 11시 이후 주문 시 익일 발송
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-4 md:gap-x-9 lg:gap-x-9 text-body-14-m">
                    <span className="text-[var(--color-text)] leading-[1.1]">제품수량</span>
                    <div className="justify-self-start flex h-[34px] items-center gap-3 rounded-[5px] border border-[var(--color-text-muted)] px-3">
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="h-6 w-6 rounded bg-[rgba(221,221,221,0.3)] text-body-13-sb"
                        aria-label="수량 감소"
                      >
                        -
                      </button>
                      <span className="min-w-3 text-center text-[12px] font-medium leading-[14px]">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="h-6 w-6 rounded bg-[rgba(221,221,221,0.3)] text-body-13-sb"
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
                    {formatWon(salePrice)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/order?planId=${selectedPlan.id}&quantity=${quantity}`)}
                  className="flex h-[48px] w-full items-center justify-center md:mt-8 lg:mt-8 rounded-[8px] text-subtitle-16-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80"
                  style={{ background: "var(--color-why-bg)" }}
                >
                  구독하기
                </button>
              </div>
            </div>
          </div>

          <div
            ref={desktopTabsRef}
            className="md:mt-8 lg:mt-8 scroll-mt-4 border-b border-[var(--color-text-muted)] pb-4"
          >
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
                    {idx < TABS.length - 1 && (
                      <span className="mx-2 h-3 w-px bg-[var(--color-text-secondary)]" />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>

          {activeTab === "info" && (
            <ProductInfoImages
              variant="desktop"
              images={detailImages}
              planName={selectedPlan.name}
              tier={selectedTier}
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
