import Image from "next/image";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";

export function CheckoutPromotionBanner() {
  return (
    <Image
      src="/images/checkout-welcome-discount.png"
      alt="신규회원 구독 15% 할인 — 웰컴 신규회원 할인"
      width={602}
      height={208}
      quality={HIGH_IMAGE_QUALITY}
      sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1199px) 280px, 300px"
      className="h-auto w-full rounded-[8px]"
    />
  );
}
