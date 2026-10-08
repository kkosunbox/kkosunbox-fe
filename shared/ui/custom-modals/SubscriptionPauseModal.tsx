"use client";

import Image from "next/image";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import ModalShell from "../modal/ModalShell";

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
}

export default function SubscriptionPauseModal({ onClose, onConfirm }: Props) {
  return (
    <ModalShell onClose={onClose}>
      {/* Card — white, 좌측 정렬 타이틀 + 중앙 아이콘 */}
      <div
        className="relative w-full max-md:max-w-[320px] md:max-w-[368px] lg:max-w-[368px]
                   rounded-[24px] bg-white
                   max-md:pt-8 md:pt-9 lg:pt-9 pb-6 px-6
                   flex flex-col"
        style={{ filter: "drop-shadow(0px 6px 20px rgba(78,78,78,0.8))" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-6 right-6 flex items-center justify-center w-6 h-6 hover:opacity-70 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 1.5L1.5 14.5M1.5 1.5L14.5 14.5" stroke="var(--color-modal-close)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="max-md:px-1 md:px-4 lg:px-4">
          {/* Title — mobile 20px / desktop 24px */}
          <h2 className="max-md:text-[20px] md:text-[24px] lg:text-[24px] font-bold leading-[125%] tracking-[-0.02em] text-black">
            잠시 이번 달만<br />
            <span className="text-[var(--color-modal-pause)]">쉬어가기</span> 시간을 가질까요?
          </h2>

          {/* Body — mobile 13px / desktop 14px */}
          <p className="mt-3 max-md:text-[13px] md:text-[14px] lg:text-[14px] font-medium leading-[160%] tracking-[-0.04em] text-[var(--color-modal-body)] break-keep">
            이번 달 결제는 진행되지 않으며, 구독 등급과<br />기존의 혜택은 안전하게 보관됩니다.
          </p>
        </div>

        {/* Icon — mobile 108px / desktop 126px (투명 여백 포함) */}
        <Image
          src="/images/modal/custom-modal-10-icon.webp"
          alt="시계 아이콘"
          width={126}
          height={126}
          quality={HIGH_IMAGE_QUALITY}
          className="mx-auto mt-3 max-md:w-[108px] max-md:h-[108px] md:w-[126px] lg:w-[126px] md:h-[126px] lg:h-[126px]"
        />

        {/* CTA button — mobile 14px / desktop 16px */}
        <button
          onClick={onConfirm ?? onClose}
          className="mt-5 w-full h-[48px] rounded-[8px] bg-[var(--color-modal-pause)]
                     max-md:text-[14px] md:text-[16px] lg:text-[16px]
                     font-semibold leading-[150%] tracking-[-0.02em] text-white
                     hover:opacity-90 transition-opacity"
        >
          이번 달만 쉬어가기
        </button>

        {/* Secondary */}
        <button
          onClick={onClose}
          className="mt-4 self-center text-[13px] font-medium leading-[16px] tracking-[-0.04em]
                     text-[var(--color-modal-sub-action)] underline
                     hover:opacity-70 transition-opacity"
        >
          취소하기
        </button>
      </div>
    </ModalShell>
  );
}
