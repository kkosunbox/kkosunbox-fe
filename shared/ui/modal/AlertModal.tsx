"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export type AlertModalType = "alert" | "contents" | "info" | "present" | "success";

export interface AlertModalOptions {
  type?: AlertModalType;
  title: string;
  description?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** 배경 클릭·ESC·확인 등으로 닫힐 때 (이탈 취소 등) */
  onDismiss?: () => void;
}

interface Props extends AlertModalOptions {
  onClose: () => void;
}

/* 디자인 원본(88×88 PNG)을 그대로 사용한다. 44px 렌더의 2배수 소스이며,
 * next/image 최적화를 거치면 기본 quality 75로 재인코딩되어 색이 탁해지므로
 * unoptimized로 원본 바이트를 그대로 내보낸다 (개당 6~10KB).
 *
 * 전달받은 원본은 아트워크가 캔버스에서 최대 5px까지 한쪽으로 쏠려 있어(타입 전환 시 아이콘이
 * 들썩임) 알파 바운딩박스 기준으로 정중앙에 재배치해뒀다. 리사이즈 없이 정수 픽셀 이동만
 * 했으므로 콘텐츠 픽셀은 원본과 바이트 단위로 동일하다. **새 아이콘을 받으면 같은 처리를 할 것.**
 *
 * TODO(디자인 재export): contents.png는 원본 export 시점에 이미 아래쪽이 잘려 있다
 * (좌측 카드의 하단 라운드 모서리 소실). 픽셀 데이터가 없어 코드로는 복구 불가.
 * 겸사겸사 5종 콘텐츠 크기가 제각각이라(74~84px) 세이프에어리어 규정해서 함께 요청할 것. */
const ICONS: Record<AlertModalType, { src: string; alt: string }> = {
  alert:    { src: "/icons/modal/alert.png",    alt: "경고" },
  contents: { src: "/icons/modal/contents.png", alt: "내용" },
  info:     { src: "/icons/modal/info.png",     alt: "안내" },
  present:  { src: "/icons/modal/present.png",  alt: "선물" },
  success:  { src: "/icons/modal/success.png",  alt: "완료" },
};

/** description 내 [텍스트] 패턴을 primary 색상으로 강조 렌더링 */
function renderDescription(text: string) {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    /^\[.+\]$/.test(part) ? (
      <span key={i} className="text-[var(--color-primary)] font-medium">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export default function AlertModal({
  type = "alert",
  title,
  description,
  primaryLabel = "확인",
  onPrimary,
  secondaryLabel,
  onSecondary,
  onDismiss,
  onClose,
}: Props) {
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryRef.current?.focus();
  }, []);

  function dismiss() {
    onDismiss?.();
    onClose();
  }

  function handlePrimary() {
    onPrimary?.();
    dismiss();
  }

  function handleSecondary() {
    onSecondary?.();
    onClose();
  }

  const icon = ICONS[type];

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[380px] rounded-[24px] overflow-hidden bg-[var(--color-border-light)]"
        style={{ boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.08)" }}
      >
        {/* Header — 웜 크림 그라디언트 */}
        <div
          className="flex flex-col items-center gap-3 pt-6 pb-4 pl-5 pr-4"
          style={{ background: "var(--gradient-modal-alert-header)" }}
        >
          <Image
            src={icon.src}
            alt={icon.alt}
            width={44}
            height={44}
            unoptimized
            className="object-contain"
          />
          <h2 className="text-[18px] font-bold leading-[152%] tracking-[-0.04em] text-[var(--color-text)] text-center">
            {title}
          </h2>
          {description && (
            <p className="text-[14px] font-normal leading-[160%] tracking-[-0.04em] text-center text-[var(--color-modal-desc)] whitespace-pre-line">
              {renderDescription(description)}
            </p>
          )}
        </div>

        {/* Footer — 화이트, 그라디언트 끝(#FFF)과 자연스럽게 이어짐 */}
        <div className="bg-white flex flex-col items-center px-5 pt-4 pb-5 gap-4" style={{ boxShadow: "0px 4px 4px rgba(16, 24, 64, 0.08)" }}>
          <button
            ref={primaryRef}
            type="button"
            onClick={handlePrimary}
            className="w-full h-12 rounded-[8px] bg-[var(--color-cta-button-soft)] text-white text-[16px] font-semibold leading-[150%] tracking-[-0.02em] hover:opacity-90 active:opacity-80 transition-opacity"
          >
            {primaryLabel}
          </button>

          {secondaryLabel && (
            <button
              type="button"
              onClick={handleSecondary}
              className="text-[14px] font-medium leading-[17px] tracking-[-0.04em] underline text-[var(--color-text-secondary)] hover:opacity-70 transition-opacity"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
