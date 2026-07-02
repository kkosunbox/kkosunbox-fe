import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { TIER_BOX_IMAGES } from "@/entities/package";
import type { PackageTier } from "@/entities/package";
import { formatOrderPrice as formatPrice } from "./orderSectionFormatters";
import { QuantityMinusIcon, QuantityPlusIcon } from "./OrderSectionIcons";
import { SectionCard } from "./OrderSectionFormParts";

interface OrderProductSectionProps {
  plan: SubscriptionPlanDto;
  open: boolean;
  onToggle: () => void;
  orderPlanTheme: { colorVar: string; tierLabel: string; tier: PackageTier };
  unitPrice: number;
  quantity: number;
  setQuantity: Dispatch<SetStateAction<number>>;
}

export function OrderProductSection({
  plan,
  open,
  onToggle,
  orderPlanTheme,
  unitPrice,
  quantity,
  setQuantity,
}: OrderProductSectionProps) {
  return (
    <SectionCard title="제품 정보" open={open} onToggle={onToggle}>
      <div>
        <div className="flex w-full items-center max-sm:gap-4 sm:gap-6">
          <div className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-[12px] max-sm:h-[104px] max-sm:w-[112px] sm:h-[122px] sm:w-[132px] md:h-[117px] md:w-[117px] md:rounded-[16px]">
            <Image
              src={TIER_BOX_IMAGES[orderPlanTheme.tier]}
              alt={plan.name}
              fill
              quality={HIGH_IMAGE_QUALITY}
              className="object-cover object-center scale-105"
              sizes="(max-width: 359px) 112px, (max-width: 767px) 132px, 117px"
              priority
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <span
              className="inline-flex w-fit items-center justify-center rounded-[30px] px-3 py-1 text-body-14-sb leading-[17px] text-white"
              style={{ background: orderPlanTheme.colorVar }}
            >
              {orderPlanTheme.tierLabel}
            </span>
            <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">
              {plan.name}
            </span>
            <span className="text-price-16-eb text-[var(--color-surface-dark)]">
              월 요금제 {formatPrice(unitPrice)}
            </span>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                aria-label="수량 감소"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex items-center justify-center text-body-14-sb text-[var(--color-text)] disabled:opacity-30 max-md:h-6 max-md:w-6 md:h-7 md:w-7 md:rounded-[5px] md:border md:border-[var(--color-border)]"
              >
                <span className="max-md:hidden" aria-hidden>−</span>
                <span className="md:hidden">
                  <QuantityMinusIcon />
                </span>
              </button>
              <span className="text-body-14-sb text-[var(--color-text)] min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="수량 증가"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                disabled={quantity >= 99}
                className="flex items-center justify-center text-body-14-sb text-[var(--color-text)] disabled:opacity-30 max-md:h-6 max-md:w-6 md:h-7 md:w-7 md:rounded-[5px] md:border md:border-[var(--color-border)]"
              >
                <span className="max-md:hidden" aria-hidden>+</span>
                <span className="md:hidden">
                  <QuantityPlusIcon />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
