"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { removeGuestCartItems } from "@/features/cart";
import { normalizeGuestOrderId, saveGuestOrderAccess } from "@/features/guest-order";
import type { GuestProductOrderDetail } from "@/features/product/api";
import { SubscriptionPromoBanner } from "@/widgets/package-plans";
import lookupNoticeIcon from "../assets/guest-order-lookup-notice.webp";
import { GuestOrderInfoCard, GuestOrderNumberBar } from "./GuestOrderParts";

interface Props {
  detail: GuestProductOrderDetail;
  /** 장바구니 주문이면 결제 완료 후 브라우저 장바구니에서 지울 항목 */
  cartItemIds: number[];
}

/** 비회원 주문 완료 — 주문번호 안내 + 상세보기(같은 탭 세션으로 조회 키 전달) */
export default function GuestOrderCompleteSection({ detail, cartItemIds }: Props) {
  const { order } = detail;
  const normalizedId = normalizeGuestOrderId(order.orderId);

  useEffect(() => {
    // 상세보기에서 연락처를 다시 묻지 않도록 같은 탭 세션에 조회 키를 남긴다.
    saveGuestOrderAccess({ orderId: order.orderId, ordererPhone: detail.ordererPhone });
    if (cartItemIds.length > 0) removeGuestCartItems(cartItemIds);
  }, [order.orderId, detail.ordererPhone, cartItemIds]);

  // 회원 주문완료(OrderCompleteSection)와 동일한 빵파레
  useEffect(() => {
    import("canvas-confetti").then(({ default: confetti }) => {
      const shared = { particleCount: 45, spread: 55, startVelocity: 42, ticks: 180, gravity: 1.3, scalar: 0.85 } as const;
      confetti({ ...shared, origin: { x: 0.1, y: 0.9 }, angle: 65 });
      confetti({ ...shared, origin: { x: 0.9, y: 0.9 }, angle: 115 });
    });
  }, []);

  return (
    <div className="relative min-h-screen bg-white pt-[var(--header-offset)]">
      <SubscriptionPromoBanner />

      <div className="mx-auto w-full max-w-[1240px] pb-16 max-xl:px-6 xl:px-0">
        <div className="pt-12 max-md:pt-8">
          <h1 className="text-[28px] font-extrabold leading-[33px] tracking-[-0.04em] text-[var(--color-why-choose-text)] max-md:text-[24px] max-md:leading-[29px]">
            주문이 <span className="text-[var(--color-cta-button)]">완료되었습니다.</span>
          </h1>
          <p className="mt-3 text-body-16-m text-[var(--color-why-choose-text)] max-md:text-body-14-m">
            소중한 주문 감사합니다. 꼼꼼하게 포장해서 보내드릴게요!
          </p>
        </div>

        <div className="mt-12 max-md:mt-8">
          <GuestOrderNumberBar orderId={order.orderId} createdAt={order.createdAt} />
        </div>

        <div className="mt-6">
          <GuestOrderInfoCard order={order} />
        </div>

        <div className="mt-6 flex items-center gap-4 rounded-[12px] bg-[var(--color-subscribe-promo-bg)] px-6 py-3 max-sm:flex-col max-sm:py-5 max-sm:text-center lg:gap-[41px] lg:pl-[79px]">
          <Image src={lookupNoticeIcon} alt="" aria-hidden="true" width={65} height={65} />
          <p className="text-body-14-m leading-6 text-[var(--color-primary)]">
            비회원 주문 시 <strong className="font-bold underline">주문번호와 연락처를 입력</strong>하시면
            <br className="max-sm:hidden" />
            비회원으로 주문하신 내역을 조회할 수 있습니다.
          </p>
        </div>

        <div className="mt-7 flex justify-center gap-6 max-sm:flex-col max-sm:gap-3">
          <Link
            href={`/guest-orders/${normalizedId}`}
            className="inline-flex h-10 w-40 items-center justify-center rounded-[8px] border border-[var(--color-cta-button)] bg-white text-body-14-sb text-[var(--color-cta-button)] transition-opacity hover:opacity-80 max-sm:w-full"
          >
            주문 상세보기
          </Link>
          <Link
            href="/products"
            className="inline-flex h-10 w-40 items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] text-body-14-sb text-white transition-opacity hover:opacity-90 max-sm:w-full"
          >
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </div>
  );
}
