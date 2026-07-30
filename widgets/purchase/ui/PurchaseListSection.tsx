/* eslint-disable @next/next/no-img-element -- 히어로 이미지는 고해상도 원본 유지가 필요해 Next/Image 미사용 */

import Image from "next/image";
import Link from "next/link";
import {
  PACKAGES,
  CURRENT_PURCHASE_TIER,
  getPackagePurchaseProduct,
  TIER_BOX_IMAGES,
  PlanRatingStars,
} from "@/entities/package";
import type { ProductDto } from "@/features/product/api/types";
import { ChevronIcon } from "@/shared/ui";
import { formatKrwPrice } from "@/shared/lib/format";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import PurchaseHeroImage from "../assets/purchase-hero.webp";
import PurchaseHeroImageTablet from "../assets/purchase-hero-tablet.webp";
import PurchaseHeroImageMobile from "../assets/purchase-hero-mobile.webp";

interface PurchaseListSectionProps {
  /** 백엔드 카탈로그에서 매칭된 실제 상품 (없으면 더미 데이터로 폴백) */
  product: ProductDto | null;
}

export default function PurchaseListSection({ product: apiProduct }: PurchaseListSectionProps) {
  const pkg = PACKAGES.find((p) => p.tier === CURRENT_PURCHASE_TIER)!;
  // 평점·티어 뱃지·박스 이미지는 백엔드가 아직 제공하지 않아 더미 유지 — 안정화되면 더미 통째로 제거 예정
  const dummyProduct = getPackagePurchaseProduct(CURRENT_PURCHASE_TIER)!;
  const displayName = apiProduct?.name ?? pkg.name;
  const displayPrice = apiProduct?.price ?? dummyProduct.price;

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

      <div className="mx-auto w-full max-w-content max-md:px-6 md:px-8 lg:px-0 max-md:py-8 md:py-0 lg:py-0 lg:pb-12">
        {/* 상품 — 현재는 프리미엄 단품만 판매 */}
        <Link href={`/purchase/detail?tier=${pkg.tier}`} className="group mt-8 flex w-[272px] flex-col md:mt-2 lg:mt-4">
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
              sizes="272px"
            />
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

        {/* 페이지네이션 — 현재 단품만 판매해 비활성 상태로만 노출 (목업 대비 기능은 대기) */}
        <div className="mt-10 flex items-center justify-center gap-3" aria-hidden>
          <span className="flex h-6 w-6 items-center justify-center opacity-30">
            <span className="rotate-90 inline-flex"><ChevronIcon open={false} size={20} /></span>
          </span>
          <span className="text-body-14-m text-[var(--color-text)]">1</span>
          <span className="flex h-6 w-6 items-center justify-center opacity-30">
            <span className="-rotate-90 inline-flex"><ChevronIcon open={false} size={20} /></span>
          </span>
        </div>
      </div>
    </div>
  );
}
