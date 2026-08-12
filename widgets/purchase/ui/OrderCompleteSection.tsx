"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PACKAGES, TIER_BOX_IMAGES, TIER_LABEL, CURRENT_PURCHASE_TIER, type PackageTier } from "@/entities/package";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { formatKrwPrice } from "@/shared/lib/format";
import orderCompleteHeroIcon from "../assets/order-complete-hero-icon.svg";
import orderCompleteHeading from "../assets/order-complete-heading.svg";
import orderCompleteDeliveryIcon from "../assets/order-complete-delivery-icon.png";

function formatOrderDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, ".");
}

interface OrderCompleteSectionProps {
  orderId: string;
  createdAt: string;
  productName: string;
  quantity: number;
  /** 서버가 확정한 실제 결제금액 (할인 반영 후) */
  amount: number;
  /**
   * 할인 전 주문상품금액 (상품 단가 × 수량).
   * 백엔드 주문 응답에 할인 필드가 없어 상품 카탈로그에서 계산해 넘긴다.
   * 카탈로그에서 상품을 못 찾으면 null — 이 경우 할인 행을 0원으로 표시한다.
   */
  basePrice: number | null;
  productId: number;
  method?: string | null;
  tier: PackageTier | null;
}

export default function OrderCompleteSection({
  orderId,
  createdAt,
  productName,
  quantity,
  amount,
  basePrice,
  productId,
  method,
  tier,
}: OrderCompleteSectionProps) {
  const effectiveTier = tier ?? CURRENT_PURCHASE_TIER;
  const pkg = PACKAGES.find((p) => p.tier === effectiveTier);
  const boxImage = TIER_BOX_IMAGES[effectiveTier];

  // 배송비는 무료배송 이벤트로 항상 0원이므로, 주문상품금액과 실제 결제금액의 차액이 곧 쿠폰 할인액이다.
  // basePrice를 못 구한 경우(카탈로그 미스)는 할인 없이 결제금액만 보여준다.
  const orderAmount = basePrice ?? amount;
  const couponDiscount = Math.max(0, orderAmount - amount);

  // 구독완료(SubscriptionManagementSection)와 동일한 빵파레 — 여긴 이 페이지 자체가
  // 결제 성공 직후에만 렌더되는 완료 화면이라 welcome 쿼리 게이팅 없이 마운트 시 1회 실행한다.
  useEffect(() => {
    import("canvas-confetti").then(({ default: confetti }) => {
      const shared = {
        particleCount: 45,
        spread: 55,
        startVelocity: 42,
        ticks: 180,
        gravity: 1.3,
        scalar: 0.85,
      } as const;
      confetti({ ...shared, origin: { x: 0.1, y: 0.9 }, angle: 65 });
      confetti({ ...shared, origin: { x: 0.9, y: 0.9 }, angle: 115 });
    });
  }, []);

  return (
    <div className="relative min-h-screen bg-white pt-[var(--header-offset)]">
      {/* 히어로 */}
      <div className="relative flex flex-col items-center bg-[var(--color-subscription-detail-header-bg)] px-6 py-10 text-center md:py-14">
        {/* eslint-disable-next-line @next/next/no-img-element -- 그라디언트+원형 벡터 아이콘, Next/Image 재인코딩 불필요 */}
        <img src={orderCompleteHeroIcon.src} alt="" aria-hidden="true" width={108} height={106} />
        {/* eslint-disable-next-line @next/next/no-img-element -- 미등록 폰트(GangwonEduPower) 텍스트를 벡터로 내보낸 헤딩 자산 */}
        <img
          src={orderCompleteHeading.src}
          alt="주문이 완료되었습니다!"
          width={251}
          height={24}
          className="mt-4 h-6 w-auto"
        />
        <p className="mt-3 text-body-16-m text-[var(--color-why-choose-text)]">
          소중한 주문 감사합니다. 꼼꼼하게 포장해서 보내드릴게요!
        </p>
      </div>

      <div className="mx-auto max-w-content max-md:px-6 md:px-6 lg:px-0 py-8">
        {/* 주문번호 · 주문일자 */}
        <div className="flex items-center justify-between rounded-[12px] bg-[var(--color-surface-light)] px-6 py-4 max-sm:flex-col max-sm:items-start max-sm:gap-1">
          <span className="text-body-13-b text-[var(--color-text)]">주문번호 No.{orderId}</span>
          <span className="text-body-13-r text-[var(--color-text-secondary)]">
            주문일자 : {formatOrderDate(createdAt)}
          </span>
        </div>

        {/* 주문상품 정보 · 결제정보 */}
        <div className="mt-6 flex flex-col overflow-hidden rounded-[12px] border border-[var(--color-text-muted)] md:flex-row">
          {/* 주문상품 정보 */}
          <div className="flex-1 p-6 md:px-9 md:py-6">
            <h2 className="text-subtitle-18-b tracking-[-0.04em] text-[var(--color-text-emphasis)]">주문상품 정보</h2>
            <div className="mt-5 flex items-center gap-4 sm:gap-6 md:gap-9">
              <div className="relative shrink-0 overflow-hidden rounded-[12px] max-sm:h-[104px] max-sm:w-[112px] sm:h-[122px] sm:w-[132px] md:h-[117px] md:w-[117px] lg:h-[148px] lg:w-[160px]">
                <Image
                  src={boxImage}
                  alt={productName}
                  fill
                  quality={HIGH_IMAGE_QUALITY}
                  className="object-cover"
                  sizes="(max-width: 359px) 112px, (max-width: 767px) 132px, (max-width: 1199px) 117px, 160px"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                {pkg && (
                  <span
                    className="inline-flex w-fit items-center justify-center rounded-[30px] px-3 py-1 text-body-14-sb leading-[17px] text-white"
                    style={{ background: pkg.colorVar }}
                  >
                    {TIER_LABEL[effectiveTier]}
                  </span>
                )}
                <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text-emphasis)]">
                  {productName}
                </span>
                <span className="text-price-16-eb text-[var(--color-surface-dark)]">단품구매</span>
                <span className="text-price-16-m text-[var(--color-text-secondary)]">수량 {quantity}개</span>
              </div>
            </div>
          </div>

          <div className="max-md:border-t md:h-[200px] md:self-center md:border-l border-[var(--color-text-muted)]" />

          {/* 결제정보 */}
          <div className="flex-1 p-6 md:px-9 md:py-6">
            <h2 className="text-subtitle-18-b text-[var(--color-text-emphasis)]">결제정보</h2>
            <div className="mt-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-body-13-m text-[var(--color-text)]">주문상품금액</span>
                <span className="text-body-13-m text-[var(--color-text)]">{formatKrwPrice(orderAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-13-m text-[var(--color-text)]">총 쿠폰 할인금액</span>
                <span className="text-body-13-m text-[var(--color-text)]">
                  -{formatKrwPrice(couponDiscount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-13-m text-[var(--color-text)]">배송비</span>
                <span className="text-body-13-m text-[var(--color-text)]">-{formatKrwPrice(0)}</span>
              </div>
            </div>

            <div className="mt-3 mb-2 border-t border-[var(--color-text-muted)]" />

            <div className="flex items-center justify-between">
              <span className="text-body-14-b text-[var(--color-text)]">총 결제금액</span>
              <span className="text-price-20-eb text-[var(--color-text)]">{formatKrwPrice(amount)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-body-13-m text-[var(--color-text)]">결제방식</span>
              <span className="text-body-13-m text-[var(--color-text)]">{method ?? "신용카드"}</span>
            </div>
          </div>
        </div>

        {/* 배송 안내 */}
        <div className="mt-6 flex items-center gap-4 lg:gap-[41px] rounded-[12px] bg-[var(--color-subscribe-promo-bg)] px-6 lg:pl-[58px] py-5 max-sm:flex-col max-sm:text-center">
          <Image src={orderCompleteDeliveryIcon} alt="" aria-hidden="true" width={32} height={32} />
          <p className="text-body-14-m text-[var(--color-primary)]">
            배송이 시작되면 알림톡 또는 문자로 배송 정보를 알려드릴게요.
            <br className="max-sm:hidden" />
            주문 내역은{" "}
            <Link href="/mypage" className="underline">
              마이페이지
            </Link>
            에서 확인할 수 있습니다.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-8 flex justify-center gap-3 max-sm:flex-col">
          <Link
            href={`/mypage/purchase?productId=${productId}`}
            className="inline-flex h-10 w-40 items-center justify-center rounded-[8px] border border-[var(--color-cta-button)] bg-white text-body-14-sb text-[var(--color-cta-button)] transition-opacity hover:opacity-80 max-sm:w-full"
          >
            주문 상세보기
          </Link>
          <Link
            href="/purchase"
            className="inline-flex h-10 w-40 items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] text-body-14-sb text-white transition-opacity hover:opacity-90 max-sm:w-full"
          >
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </div>
  );
}
