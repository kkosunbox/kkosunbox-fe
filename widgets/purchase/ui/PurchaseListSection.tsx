/* eslint-disable @next/next/no-img-element -- 히어로 이미지는 고해상도 원본 유지가 필요해 Next/Image 미사용 */

import Image from "next/image";
import Link from "next/link";
import {
  COMPARE_PACKAGES,
  getPackagePurchaseProduct,
  TIER_BOX_IMAGES,
  TIER_LABEL,
  PlanRatingStars,
  type PackageTier,
} from "@/entities/package";
import type { ProductDto } from "@/features/product/api/types";
import { formatKrwPrice } from "@/shared/lib/format";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import PurchaseHeroImage from "../assets/purchase-hero.webp";
import PurchaseHeroImageTablet from "../assets/purchase-hero-tablet.webp";
import PurchaseHeroImageMobile from "../assets/purchase-hero-mobile.webp";

interface PurchaseListSectionProps {
  /** 티어별로 백엔드 카탈로그에서 매칭된 실제 상품 (없으면 더미 데이터로 폴백) */
  productsByTier: Record<PackageTier, ProductDto | null>;
}

export default function PurchaseListSection({ productsByTier }: PurchaseListSectionProps) {
  return (
    <div>
      {/* Hero */}
      <section className="relative w-full overflow-hidden" aria-label="구매하기">
        {/* 모바일 (< 768px) */}
        <div className="flex h-[calc(156px+var(--banner-height))] w-full items-end overflow-hidden md:hidden">
          <img
            src={PurchaseHeroImageMobile.src}
            alt="꼬순박스를 부담없이 먼저 경험해 보세요."
            width={PurchaseHeroImageMobile.width}
            height={PurchaseHeroImageMobile.height}
            className="h-[156px] w-full shrink-0 object-cover object-center"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* 태블릿 (768px~1199px) */}
        <div className="max-md:hidden lg:hidden flex h-[calc(156px+var(--banner-height))] w-full items-end overflow-hidden">
          <img
            src={PurchaseHeroImageTablet.src}
            alt="꼬순박스를 부담없이 먼저 경험해 보세요."
            width={PurchaseHeroImageTablet.width}
            height={PurchaseHeroImageTablet.height}
            className="h-[156px] w-full shrink-0 object-cover object-center"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* 데스크톱 (≥ 1200px) */}
        <div className="max-lg:hidden flex h-[calc(306px+var(--banner-height))] w-full items-end overflow-hidden">
          <div className="relative w-full h-[306px]">
            <div className="absolute inset-x-0 top-0 h-[256px] w-full bg-support-hero-side-bg" />
            <div className="relative mx-auto h-[306px] w-full max-w-[1920px] overflow-hidden">
              <img
                src={PurchaseHeroImage.src}
                alt="꼬순박스를 부담없이 먼저 경험해 보세요. 구독 제품을 단품으로 구매하실 수 있습니다."
                width={PurchaseHeroImage.width}
                height={PurchaseHeroImage.height}
                className="absolute inset-0 h-full w-full object-cover object-center"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-content max-md:px-6 md:px-8 lg:px-0 max-md:pt-1 md:max-lg:pt-2 lg:pt-0 max-md:pb-8 md:pb-0 lg:pb-12">
        {/* 상품 그리드 — Premium·Standard·Basic 단품 (다른 비교 화면과 동일하게 프리미엄 우선 정렬) */}
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-6">
          {COMPARE_PACKAGES.map((pkg) => {
            const apiProduct = productsByTier[pkg.tier];
            const dummyProduct = getPackagePurchaseProduct(pkg.tier)!;
            const displayName = apiProduct?.name ?? pkg.name;
            const displayPrice = apiProduct?.price ?? dummyProduct.price;

            return (
              <Link
                key={pkg.tier}
                href={`/purchase/detail?tier=${pkg.tier}`}
                className="group flex w-full flex-col"
              >
                <div
                  className="relative aspect-[272/252] w-full overflow-hidden rounded-[16px]"
                  style={{ boxShadow: "var(--shadow-card-soft)" }}
                >
                  <Image
                    src={TIER_BOX_IMAGES[pkg.tier]}
                    alt={displayName}
                    fill
                    quality={HIGH_IMAGE_QUALITY}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 639px) 100vw, (max-width: 767px) 50vw, 33vw"
                  />
                  <span
                    className="absolute left-3 top-3 inline-flex items-center justify-center rounded-[30px] px-3 py-1 text-body-13-sb text-white"
                    style={{ background: pkg.colorVar }}
                  >
                    {TIER_LABEL[pkg.tier]}
                  </span>
                </div>
                <div className="flex flex-col gap-2 pt-6">
                  <span className="text-subtitle-18-sb text-[var(--color-text-emphasis)] group-hover:text-[var(--color-primary)] transition-colors">
                    {displayName}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-body-16-b text-[var(--color-text-body-warm)]">단품 구매</span>
                    <span className="text-price-20-eb text-[var(--color-text-emphasis)]">
                      {formatKrwPrice(displayPrice)}
                    </span>
                  </div>
                  <PlanRatingStars rating={dummyProduct.rating} size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
