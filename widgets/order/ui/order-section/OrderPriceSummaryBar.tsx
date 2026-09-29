import { Fragment, type ReactNode } from "react";
import { formatKrwPrice as formatPrice } from "@/shared/lib/format";
import { ShippingFeeWaiver } from "@/shared/ui";

interface OrderPriceSummaryBarProps {
  productLabel?: string;
  totalLabel?: string;
  basePrice: number;
  totalDiscount: number;
  shippingFee: number;
  /** 제공되고 shippingFee보다 크면 취소선 원가로 함께 표시 (무료배송 이벤트 등) */
  originalShippingFee?: number;
  total: number;
}

export function OrderPriceSummaryBar({
  productLabel = "주문상품금액",
  totalLabel = "총 주문금액",
  basePrice,
  totalDiscount,
  shippingFee,
  originalShippingFee,
  total,
}: OrderPriceSummaryBarProps) {
  const showShippingWaiver = originalShippingFee !== undefined && originalShippingFee > shippingFee;
  const shippingValue: ReactNode = showShippingWaiver ? (
    <ShippingFeeWaiver />
  ) : (
    formatPrice(shippingFee)
  );

  const priceSummaryItems: { label: string; value: ReactNode; emphasis: boolean }[] = [
    { label: productLabel, value: formatPrice(basePrice), emphasis: false },
    { label: "총 할인금액", value: formatPrice(totalDiscount), emphasis: false },
    { label: "총 배송비", value: shippingValue, emphasis: false },
    { label: totalLabel, value: formatPrice(total), emphasis: true },
  ];

  return (
    <div className="w-full bg-[var(--color-purchase-banner-bg)]">
      <div className="mx-auto flex w-full max-w-[806px] items-center justify-between max-md:px-3 md:px-8 max-md:h-[81px] md:h-[56px]">
        {priceSummaryItems.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && (
              <span className="shrink-0 text-subtitle-16-sb tracking-[-0.04em] text-white">
                {index === 3 ? "=" : index === 2 ? "+" : "-"}
              </span>
            )}
            <div className={item.emphasis ? "flex flex-col items-center md:flex-row md:gap-3" : "flex flex-col items-center md:flex-row md:gap-2"}>
              <span
                className={[
                  "whitespace-nowrap tracking-[-0.04em]",
                  item.emphasis
                    ? "text-body-13-m text-[var(--color-banner-bg)] md:text-subtitle-16-b"
                    : "text-body-13-m text-white md:text-subtitle-16-sb",
                ].join(" ")}
              >
                {item.label}
              </span>
              <span
                className={[
                  "whitespace-nowrap tracking-[-0.04em]",
                  item.emphasis
                    ? "text-body-14-sb text-[var(--color-banner-bg)] md:text-subtitle-20-b"
                    : "text-body-14-sb text-white md:text-subtitle-16-sb",
                ].join(" ")}
              >
                {item.value}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
