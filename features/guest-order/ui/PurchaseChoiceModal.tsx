"use client";

import Image from "next/image";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { ModalShell } from "@/shared/ui";
import purchaseChoiceBag from "../assets/purchase-choice-bag.webp";

interface Props {
  onClose: () => void;
  onGuest: () => void;
  onMember: () => void;
}

/** 로그아웃 상태에서 구매하기 — 회원(로그인·가입) / 비회원 구매 선택 */
export function PurchaseChoiceModal({ onClose, onGuest, onMember }: Props) {
  return (
    <ModalShell label="구매 방법 선택" onClose={onClose}>
      <div
        className="relative w-full max-w-[368px] rounded-[24px] bg-white p-7"
        style={{ boxShadow: "0px 4px 12px 4px rgba(0, 0, 0, 0.24)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="pr-6">
          <h2 className="text-[24px] font-bold leading-[1.2] tracking-[-0.03em] text-[var(--color-text)]">
            회원가입하면
            <br />
            <span className="text-[var(--color-checkbox-checked)]">더 많은 혜택</span>이 있어요.
          </h2>
          <p className="mt-3 text-[14px] font-medium leading-[1.6] tracking-[-0.04em] text-[var(--color-text-on-warm)]">
            회원가입하고 꼬순박스의 다양한 혜택을 누려보세요.
            <br />
            가입하지 않아도 비회원으로 주문할 수 있어요.
          </p>
        </div>

        <Image
          src={purchaseChoiceBag}
          alt=""
          aria-hidden="true"
          width={139}
          height={131}
          quality={HIGH_IMAGE_QUALITY}
          className="mx-auto mt-6 h-auto"
        />

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onMember}
            className="h-12 w-full rounded-[8px] bg-[var(--color-cta-button)] text-[16px] font-semibold leading-[1.5] tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
          >
            회원가입하고 혜택받기
          </button>
          <button
            type="button"
            onClick={onGuest}
            className="h-12 w-full rounded-[8px] border border-[var(--color-cta-button)] bg-white text-[16px] font-semibold leading-[1.5] tracking-[-0.02em] text-[var(--color-cta-button)] transition-opacity hover:opacity-90"
          >
            비회원으로 구매하기
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
