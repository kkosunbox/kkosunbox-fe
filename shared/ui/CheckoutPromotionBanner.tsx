import Image from "next/image";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";

export function CheckoutPromotionBanner() {
  return (
    <Image
      src="/images/checkout-subscribe-discount.webp"
      alt="꼬순박스 구독하면 15% 할인 — 매달 맛있는 간식이 집 앞으로 찾아가요!"
      width={602}
      height={208}
      quality={HIGH_IMAGE_QUALITY}
      sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1199px) 280px, 300px"
      className="h-auto w-full rounded-[8px]"
    />
  );
}
