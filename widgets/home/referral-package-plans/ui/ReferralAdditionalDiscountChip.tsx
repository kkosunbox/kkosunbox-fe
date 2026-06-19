import { Text } from "@/shared/ui";

type ReferralAdditionalDiscountChipProps = {
  pct: number;
  className?: string;
};

export function ReferralAdditionalDiscountChip({
  pct,
  className,
}: ReferralAdditionalDiscountChipProps) {
  return (
    <Text
      as="span"
      variant="caption-12-b-tight"
      className={[
        "absolute z-10 inline-flex items-center justify-center rounded-[5px] px-1.5 py-1",
        "bg-[var(--color-referral-discount-chip-bg)] text-[var(--color-referral-discount-chip-text)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {pct}%추가할인
    </Text>
  );
}
