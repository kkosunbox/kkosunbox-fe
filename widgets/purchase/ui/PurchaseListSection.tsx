/* eslint-disable @next/next/no-img-element -- 히어로 이미지는 고해상도 원본 유지가 필요해 Next/Image 미사용 */

import Image from "next/image";
import Link from "next/link";
import {
  COMPARE_PACKAGES,
  getPackagePurchaseProduct,
  TIER_BOX_IMAGES,
  PlanRatingStars,
  getPackageProductPath,
  type PackageTier,
} from "@/entities/package";
import type { ProductDto } from "@/features/product/api/types";
import { formatKrwPrice } from "@/shared/lib/format";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { DesktopHeroSideBackground, FreeShippingBadge } from "@/shared/ui";
import PurchaseHeroImage from "../assets/purchase-hero.webp";
import PurchaseHeroImageTablet from "../assets/purchase-hero-tablet.webp";
import PurchaseHeroImageMobile from "../assets/purchase-hero-mobile.webp";

interface PurchaseListSectionProps {
  /** 티어별로 백엔드 카탈로그에서 매칭된 실제 상품 (없으면 더미 가격으로 폴백) */
  productsByTier: Record<PackageTier, ProductDto | null>;
  products: ProductDto[];
  /** 티어별 실제 평균 별점 (구독 플랜 `averageRating`). 0이면 리뷰가 없다는 뜻이라 별점을 숨긴다. */
  ratingByTier: Record<PackageTier, number>;
}

export default function PurchaseListSection({
  productsByTier,
  products,
  ratingByTier,
}: PurchaseListSectionProps) {
  function ProductCard({ product, pkg }: { product: ProductDto; pkg?: (typeof COMPARE_PACKAGES)[number] }) {
    const displayPrice = product.price;
    const href = `/purchase/detail?productId=${product.id}`;
    return <Link href={href} className="group flex w-full flex-col">
      <div className="relative aspect-[272/252] w-full overflow-hidden rounded-[16px]" style={{ boxShadow: "var(--shadow-card-soft)" }}>
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : pkg ? <Image src={TIER_BOX_IMAGES[pkg.tier]} alt={product.name} fill quality={HIGH_IMAGE_QUALITY} className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 639px) 100vw, (max-width: 767px) 50vw, 33vw" /> : <div className="h-full w-full bg-[var(--color-surface-warm)]" />}
        {product.relatedPlanId && product.relatedPlanSlug ? <span className="absolute left-3 top-3 inline-flex items-center justify-center rounded-[30px] bg-[var(--color-primary)] px-3 py-1 text-body-13-sb text-white">{product.relatedPlanSlug}</span> : null}
        {(product.isSoldOut || product.isSalesPaused) && <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-body-16-b text-white">{product.isSoldOut ? "품절" : "판매 중지"}</span>}
      </div>
      <div className="flex flex-col gap-2 pt-6"><span className="text-subtitle-18-sb text-[var(--color-text-emphasis)] transition-colors group-hover:text-[var(--color-primary)]">{product.name}</span><div className="flex flex-wrap items-center gap-2"><span className="text-body-16-b text-[var(--color-text-body-warm)]">단품 구매</span><span className="text-price-20-eb text-[var(--color-text-emphasis)]">{formatKrwPrice(displayPrice)}</span><FreeShippingBadge /></div><div className="flex items-center gap-2"><PlanRatingStars rating={product.averageRating} size={16} /><span className="text-body-13-r text-[var(--color-text-secondary)]">리뷰 {product.reviewCount}개</span></div></div>
    </Link>;
  }
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
            <DesktopHeroSideBackground />
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
        {/* 상품 그리드 — API가 내려준 전체 단품 목록과 순서를 그대로 사용한다. */}
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-6">
          {products.length > 0 ? products.map((product) => {
            const pkg = COMPARE_PACKAGES.find(
              (item) => productsByTier[item.tier]?.id === product.id,
            );
            return <ProductCard key={product.id} product={product} pkg={pkg} />;
          }) : COMPARE_PACKAGES.map((pkg) => {
            const apiProduct = productsByTier[pkg.tier];
            const displayName = apiProduct?.name ?? pkg.name;
            // 가격은 카탈로그가 비었을 때만 더미로 폴백한다(결제는 productId === null 가드가 차단).
            const displayPrice = apiProduct?.price ?? getPackagePurchaseProduct(pkg.tier)!.price;
            const rating = ratingByTier[pkg.tier];

            if (apiProduct) return <ProductCard key={apiProduct.id} product={apiProduct} pkg={pkg} />;
            return (
              <Link
                key={pkg.tier}
                href={getPackageProductPath(pkg.tier)}
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
                </div>
                <div className="flex flex-col gap-2 pt-6">
                  <span className="text-subtitle-18-sb text-[var(--color-text-emphasis)] group-hover:text-[var(--color-primary)] transition-colors">
                    {displayName}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-body-16-b text-[var(--color-text-body-warm)]">단품 구매</span>
                    <span className="text-price-20-eb text-[var(--color-text-emphasis)]">
                      {formatKrwPrice(displayPrice)}
                    </span>
                    <FreeShippingBadge />
                  </div>
                  {rating > 0 ? <PlanRatingStars rating={rating} size={16} /> : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
