import Image from "next/image";
import { SectionCard, QuantityMinusIcon, QuantityPlusIcon } from "@/shared/ui";
import { TIER_BOX_IMAGES, TIER_LABEL, type PackageData } from "@/entities/package";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { formatKrwPrice } from "@/shared/lib/format";
import { QUANTITY_MIN, QUANTITY_MAX } from "../purchaseOrderHelpers";

interface PurchaseProductInfoCardProps {
  pkg: PackageData;
  unitPrice: number;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  open: boolean;
  onToggle: () => void;
}

export function PurchaseProductInfoCard({
  pkg,
  unitPrice,
  quantity,
  onDecrease,
  onIncrease,
  open,
  onToggle,
}: PurchaseProductInfoCardProps) {
  return (
    <SectionCard title="제품 정보" open={open} onToggle={onToggle}>
      <div className="flex w-full items-center max-sm:gap-4 sm:gap-6">
        <div className="relative shrink-0 overflow-hidden rounded-[12px] max-sm:h-[104px] max-sm:w-[112px] sm:h-[122px] sm:w-[132px] md:h-[117px] md:w-[117px] md:rounded-[16px]">
          <Image
            src={TIER_BOX_IMAGES[pkg.tier]}
            alt={pkg.name}
            fill
            quality={HIGH_IMAGE_QUALITY}
            className="object-cover"
            sizes="(max-width: 359px) 112px, (max-width: 767px) 132px, 117px"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <span
            className="inline-flex w-fit items-center justify-center rounded-[30px] px-3 py-1 text-body-14-sb leading-[17px] text-white"
            style={{ background: pkg.colorVar }}
          >
            {TIER_LABEL[pkg.tier]}
          </span>
          <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">{pkg.name}</span>
          <span className="text-price-16-eb text-[var(--color-surface-dark)]">{formatKrwPrice(unitPrice)}</span>
          <div className="mt-1 flex items-center gap-3">
            <button
              type="button"
              aria-label="수량 감소"
              onClick={onDecrease}
              disabled={quantity <= QUANTITY_MIN}
              className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-[var(--color-border)] text-body-14-sb text-[var(--color-text)] disabled:opacity-30"
            >
              <span className="max-md:hidden" aria-hidden>−</span>
              <span className="md:hidden">
                <QuantityMinusIcon />
              </span>
            </button>
            <span className="min-w-[20px] text-center text-body-14-sb text-[var(--color-text)]">{quantity}</span>
            <button
              type="button"
              aria-label="수량 증가"
              onClick={onIncrease}
              disabled={quantity >= QUANTITY_MAX}
              className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-[var(--color-border)] text-body-14-sb text-[var(--color-text)] disabled:opacity-30"
            >
              <span className="max-md:hidden" aria-hidden>+</span>
              <span className="md:hidden">
                <QuantityPlusIcon />
              </span>
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
