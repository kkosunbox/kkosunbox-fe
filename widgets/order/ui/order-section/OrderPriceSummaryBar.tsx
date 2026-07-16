import { Fragment } from "react";
import { formatKrwPrice as formatPrice } from "@/shared/lib/format";

interface OrderPriceSummaryBarProps {
  basePrice: number;
  totalDiscount: number;
  total: number;
}

export function OrderPriceSummaryBar({ basePrice, totalDiscount, total }: OrderPriceSummaryBarProps) {
  const priceSummaryItems = [
    { label: "주문상품금액", value: formatPrice(basePrice), emphasis: false },
    { label: "총 할인금액", value: formatPrice(totalDiscount), emphasis: false },
    { label: "총 배송비", value: "0원", emphasis: false },
    { label: "총 주문금액", value: formatPrice(total), emphasis: true },
  ] as const;

  return (
    <div className="w-full bg-[var(--color-top-band-bg)]">
      <div className="mx-auto flex w-full max-w-[806px] items-center justify-between px-8 max-md:h-[81px] md:h-[58px]">
        {priceSummaryItems.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && (
              <span className="shrink-0 text-subtitle-16-sb tracking-[-0.04em] text-white">
                {index === 3 ? "=" : index === 2 ? "-" : "+"}
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
