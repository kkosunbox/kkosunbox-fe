/* eslint-disable @next/next/no-img-element -- GangwonEduPower는 웹 미지원 폰트라 outline SVG로 대체 */

import Image from "next/image";
import Link from "next/link";
import {
  PACKAGES,
  CURRENT_PURCHASE_TIER,
  getPackagePurchaseProduct,
  TIER_BOX_IMAGES,
  PlanRatingStars,
} from "@/entities/package";
import { SHOP_FREE_SHIPPING_THRESHOLD } from "@/entities/product";
import { ChevronIcon } from "@/shared/ui";
import { formatKrwPrice } from "@/shared/lib/format";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import purchaseHeroTitle from "../assets/purchase-hero-title.svg";

export default function PurchaseListSection() {
  const pkg = PACKAGES.find((p) => p.tier === CURRENT_PURCHASE_TIER)!;
  const product = getPackagePurchaseProduct(CURRENT_PURCHASE_TIER)!;

  return (
    <div className="pt-[var(--header-offset)]">
      <div className="mx-auto w-full max-w-content max-md:px-6 md:px-8 lg:px-0 max-md:py-8 md:py-12 lg:py-16">
        {/* 타이틀 */}
        <div className="flex flex-col gap-2">
          <span className="text-body-14-sb text-[var(--color-primary)]">구매하기</span>
          <img
            src={purchaseHeroTitle.src}
            alt="꼬순박스를 부담 없이 먼저 경험해 보세요."
            width={441}
            height={25}
            className="h-auto max-md:w-[260px] md:w-[360px] lg:w-[420px]"
            loading="eager"
            decoding="async"
          />
          <p className="max-md:text-body-14-r md:text-body-16-r text-[var(--color-text-secondary)]">
            구독 제품을 단품으로 구매하실 수 있습니다.
            {" "}
            {formatKrwPrice(SHOP_FREE_SHIPPING_THRESHOLD)} 이상 구매 시 무료배송.
          </p>
        </div>

        {/* 상품 — 현재는 프리미엄 단품만 판매 */}
        <Link href={`/purchase/order?tier=${pkg.tier}`} className="group mt-8 flex w-[272px] flex-col md:mt-10 lg:mt-12">
          <div
            className="relative aspect-[272/252] w-full overflow-hidden rounded-[16px]"
            style={{ boxShadow: "var(--shadow-card-soft)" }}
          >
            <Image
              src={TIER_BOX_IMAGES[pkg.tier]}
              alt={pkg.name}
              fill
              quality={HIGH_IMAGE_QUALITY}
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="272px"
            />
          </div>
          <div className="flex flex-col gap-2 pt-6">
            <span className="text-subtitle-18-sb text-[var(--color-text-emphasis)] group-hover:text-[var(--color-primary)] transition-colors">
              {pkg.name}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-body-16-b text-[var(--color-text-body-warm)]">단품 구매</span>
              <span className="text-price-20-eb text-[var(--color-text-emphasis)]">
                {formatKrwPrice(product.price)}
              </span>
            </div>
            <PlanRatingStars rating={product.rating} size={16} />
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
