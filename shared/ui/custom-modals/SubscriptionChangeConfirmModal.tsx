"use client";

import Image from "next/image";

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
}

export default function SubscriptionChangeConfirmModal({ onClose, onConfirm }: Props) {
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
          src="/images/modal/custom-modal-11-upper.png"
          alt="경고 아이콘"
          width={210}
          height={210}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10
                     max-md:w-[160px] max-md:h-[160px] md:w-[210px] md:h-[210px]"
        />

        <div
          className="relative
                     max-md:mt-[59px] md:mt-[80px]
                     max-md:rounded-[32px] md:rounded-[40px]
                     max-md:pt-[110px] md:pt-[128px]
                     pb-6 px-6
                     flex flex-col items-center"
          style={{ background: "var(--gradient-modal-warning)" }}
        >
          <button
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-6 right-6 flex items-center justify-center w-6 h-6 hover:opacity-70 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <Image
            src="/images/modal/custom-modal-11-contents.png"
            alt="다른 플랜으로 구독 변경을 하시겠습니까?"
            width={206}
            height={129}
            className="h-auto max-w-full"
          />

          <p className="mt-5 max-md:text-[13px] md:text-[14px] font-medium leading-[160%] tracking-[-0.04em] text-white text-center">
            아래의 &lsquo;다른 플랜 선택하기&rsquo;를 통해<br />원하시는 구성을 찾아보세요.
          </p>

          <button
            onClick={onConfirm ?? onClose}
            className="mt-7 w-full h-[48px] rounded-[30px] bg-white
                       max-md:text-[14px] md:text-[16px]
                       font-semibold leading-[150%] tracking-[-0.02em] text-[var(--color-text)]
                       hover:opacity-90 transition-opacity"
          >
            다른 플랜 선택하기
          </button>

          <button
            onClick={onClose}
            className="mt-4 text-[13px] font-medium leading-[16px] tracking-[-0.04em]
                       text-white underline
                       hover:opacity-70 transition-opacity"
          >
            다음에 하기
          </button>
        </div>
      </div>
    </div>
  );
}
