import Image from "next/image";
import ticketIcon from "../assets/ticket-use.svg";

type ReferralFirstMonthOfferProps = {
  /** 초대 추가 할인율(%) */
  pct: number;
  /** 초대 할인이 반영된 첫 달 단가(원) — 서버 `referralDiscountedPrice` 그대로 */
  price: number;
  /**
   * - `showcase` — 패키지 쇼케이스(홈·초대·구독 메뉴). 배경 사진 위 반투명 카드
   * - `panel`    — 구독 상세 가격 패널 안의 흰 카드
   */
  variant?: "showcase" | "panel";
  className?: string;
};

const VARIANT_CLASS = {
  showcase:
    "min-h-[68px] rounded-[12px] border-[var(--color-referral-offer-border)] bg-white/50 max-md:min-h-[60px]",
  panel: "min-h-[60px] rounded-[8px] border-[var(--color-referral-offer-border-soft)] bg-white",
} as const;

/** 초대 혜택(첫 달 추가 할인) 안내 박스 — 월 가격과 분리해 첫 달 결제 금액을 보여준다. */
export function ReferralFirstMonthOffer({
  pct,
  price,
  variant = "showcase",
  className,
}: ReferralFirstMonthOfferProps) {
  return (
    <div
      className={[
        "flex items-center gap-3 border px-4 py-2 max-md:gap-2 max-md:px-3",
        VARIANT_CLASS[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image src={ticketIcon} alt="" width={24} height={24} className="shrink-0" />
      <span className="min-w-0 flex-1 tracking-[-0.04em] text-[var(--color-text)]">
        <span className="block whitespace-nowrap text-[13px] font-medium leading-4 max-sm:text-[12px]">초대 혜택 적용</span>
        <span className="mt-px block whitespace-nowrap text-[16px] font-extrabold leading-[19px] max-md:text-[14px] max-md:leading-[17px] max-sm:text-[13px]">
          첫 달 {pct}% 추가 할인
        </span>
      </span>
      <strong className="shrink-0 whitespace-nowrap text-[32px] font-extrabold leading-[38px] tracking-[-0.05em] text-[var(--color-referral-offer-price)] max-md:text-[24px] max-md:leading-[29px] max-sm:text-[20px] max-sm:leading-[24px]">
        {price.toLocaleString("ko-KR")}원
      </strong>
    </div>
  );
}
