"use client";

import Image from "next/image";

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
}

export default function SubscriptionPauseModal({ onClose, onConfirm }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        className="relative z-10 w-full max-md:max-w-[320px] md:max-w-[388px]"
        style={{ filter: "drop-shadow(0px 6px 20px rgba(78,78,78,0.8))" }}
      >
        <Image
          src="/images/modal/custom-modal-10-upper.png"
          alt="시계 아이콘"
          width={210}
          height={210}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10
                     max-md:w-[160px] max-md:h-[160px] md:w-[210px] md:h-[210px]"
        />

        <div
          className="relative
                     max-md:mt-[59px] md:mt-[80px]
                     max-md:rounded-[32px] md:rounded-[40px]
                     max-md:pt-[110px] md:pt-[140px]
                     pb-6 px-6
                     flex flex-col items-center"
          style={{ background: "var(--gradient-modal-pause)" }}
        >
          <button
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-6 right-6 flex items-center justify-center w-6 h-6 hover:opacity-70 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <Image
            src="/images/modal/custom-modal-10-contents.png"
            alt="잠시 이번 달만 쉬어가기의 시간을 가질까요?"
            width={280}
            height={140}
            className="h-auto max-w-full"
          />

          <p className="mt-5 max-md:text-[13px] md:text-[14px] font-medium leading-[160%] tracking-[-0.04em] text-[var(--color-text)] text-center">
            이번 달 결제는 진행되지 않으며,<br />
            구독 등급과 기존의 혜택은 안전하게 보관됩니다.
          </p>

          <button
            onClick={onConfirm ?? onClose}
            className="mt-7 w-full h-[48px] rounded-[30px] bg-white
                       max-md:text-[14px] md:text-[16px]
                       font-semibold leading-[150%] tracking-[-0.02em] text-[var(--color-text)]
                       hover:opacity-90 transition-opacity"
          >
            이번 달만 쉬어가기
          </button>

          <button
            onClick={onClose}
            className="mt-4 text-[13px] font-medium leading-[16px] tracking-[-0.04em]
                       text-[var(--color-text-tertiary)] underline
                       hover:opacity-70 transition-opacity"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
