/* eslint-disable @next/next/no-img-element -- 상품 썸네일은 서버의 동적 원격 URL이다. */
import Image from "next/image";
import { SectionCard, QuantityMinusIcon, QuantityPlusIcon } from "@/shared/ui";
import { TIER_BOX_IMAGES, type PackageData } from "@/entities/package";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { formatKrwPrice } from "@/shared/lib/format";
import { QUANTITY_MIN, QUANTITY_MAX } from "../purchaseOrderHelpers";

interface PurchaseProductInfoCardProps {
  pkg: PackageData;
  imageUrl?: string | null;
  relatedPlanSlug?: string | null;
  unitPrice: number;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  open: boolean;
  onToggle: () => void;
}

export function PurchaseProductInfoCard({
  pkg,
  imageUrl,
  unitPrice,
  quantity,
  onDecrease,
  onIncrease,
  open,
  onToggle,
}: PurchaseProductInfoCardProps) {
  return (
    <SectionCard variant="order" title="제품정보" open={open} onToggle={onToggle}>
      <div className="flex w-full items-center max-sm:gap-4 sm:gap-6 md:px-6">
        <div className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-[12px] max-sm:h-[104px] max-sm:w-[112px] sm:max-md:h-[122px] sm:max-md:w-[132px] md:h-[148px] md:w-[160px]">
          {imageUrl ? <img src={imageUrl} alt={pkg.name} className="h-full w-full object-cover" /> : <Image
            src={TIER_BOX_IMAGES[pkg.tier]}
            alt={pkg.name}
            fill
            quality={HIGH_IMAGE_QUALITY}
            className="object-cover"
            sizes="(max-width: 359px) 112px, (max-width: 767px) 132px, 160px"
          />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">{pkg.name}</span>
            <span className="rounded-[3px] bg-[var(--color-surface-light)] px-1 text-body-12-r text-[var(--color-text-secondary)]">단품</span>
          </div>
          <span className="text-body-14-m text-[var(--color-text-secondary)]">단품구매</span>
          <div className="mt-1 flex items-center gap-3">
            <button
              type="button"
              aria-label="수량 감소"
              onClick={onDecrease}
              disabled={quantity <= QUANTITY_MIN}
              className="flex items-center justify-center text-body-14-sb text-[var(--color-text)] disabled:opacity-30 h-6 w-6"
            >
              <span>
                <QuantityMinusIcon />
              </span>
            </button>
            <span className="min-w-[20px] text-center text-body-14-sb text-[var(--color-text)]">{quantity}</span>
            <button
              type="button"
              aria-label="수량 증가"
              onClick={onIncrease}
              disabled={quantity >= QUANTITY_MAX}
              className="flex items-center justify-center text-body-14-sb text-[var(--color-text)] disabled:opacity-30 h-6 w-6"
            >
              <span>
                <QuantityPlusIcon />
              </span>
            </button>
          </div>
          <span className="text-price-16-eb text-[var(--color-surface-dark)]">{formatKrwPrice(unitPrice)}</span>
        </div>
      </div>
    </SectionCard>
  );
}
