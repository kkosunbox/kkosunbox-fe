"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface DaumPostcodeData {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  autoRoadAddress: string;
  autoJibunAddress: string;
  buildingName: string;
  apartment: string;
  addressType: "R" | "J";
}

declare global {
  interface Window {
    daum: {
      Postcode: new (opts: {
        oncomplete: (data: DaumPostcodeData) => void;
        onclose?: () => void;
        width: string;
        height: string;
      }) => { embed: (el: HTMLElement) => void };
    };
  }
}

interface Props {
  onComplete: (zipCode: string, address: string) => void;
  onClose: () => void;
}

export default function DaumPostcodeEmbed({ onComplete, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  function openEmbed() {
    if (!containerRef.current || !window.daum) return;
    new window.daum.Postcode({
      oncomplete(data: DaumPostcodeData) {
        const addr =
          data.addressType === "R" ? data.roadAddress : data.jibunAddress;
        onComplete(data.zonecode, addr);
      },
      onclose: onClose,
      width: "100%",
      height: "100%",
    }).embed(containerRef.current);
  }

  useEffect(() => {
    if (loadedRef.current && window.daum) openEmbed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-4 pt-8">
        <h2 className="text-subtitle-20-b tracking-tightest text-[var(--color-text)]">
          주소를 검색해주세요
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-8 w-8 items-center justify-center text-[var(--color-text)] transition-opacity hover:opacity-70"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path
              d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Postcode embed container */}
      <div ref={containerRef} className="flex-1 px-6 pb-6" />

      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
        onLoad={() => {
          loadedRef.current = true;
          openEmbed();
        }}
      />
    </div>
  );
}
