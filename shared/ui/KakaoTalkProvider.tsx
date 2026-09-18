"use client";

import { useCallback, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { isPopupRoute } from "@/shared/config/popupRoutes";

declare global {
  interface Window {
    Kakao?: {
      init: (javascriptKey: string) => void;
      isInitialized: () => boolean;
      Channel: {
        chat: (options: { channelPublicId: string }) => void;
      };
    };
  }
}

const JAVASCRIPT_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "";
const CHANNEL_PUBLIC_ID =
  process.env.NEXT_PUBLIC_KAKAO_CHANNEL_PUBLIC_ID ?? "";

const KAKAO_SDK_URL =
  "https://t1.kakaocdn.net/kakao_js_sdk/2.8.3/kakao.min.js";

export function KakaoTalkProvider() {
  const pathname = usePathname();
  const isPopup = isPopupRoute(pathname);
  const [isSdkReady, setIsSdkReady] = useState(false);

  const initializeKakao = useCallback(() => {
    const kakao = window.Kakao;
    if (!kakao) return;

    if (!kakao.isInitialized()) {
      kakao.init(JAVASCRIPT_KEY);
    }

    setIsSdkReady(kakao.isInitialized());
  }, []);

  const openKakaoChat = useCallback(() => {
    window.Kakao?.Channel.chat({ channelPublicId: CHANNEL_PUBLIC_ID });
  }, []);

  if (isPopup || !JAVASCRIPT_KEY || !CHANNEL_PUBLIC_ID) return null;

  return (
    <>
      <Script
        id="kakao-javascript-sdk"
        src={KAKAO_SDK_URL}
        strategy="afterInteractive"
        crossOrigin="anonymous"
        onLoad={initializeKakao}
        onReady={initializeKakao}
      />
      {isSdkReady && (
        <button
          type="button"
          onClick={openKakaoChat}
          className="fixed z-[50] flex flex-col items-center justify-center gap-1 rounded-[14px] bg-[var(--color-kakao)] text-[var(--color-text-primary)] shadow-[var(--shadow-card-selected)] transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)] max-md:right-4 max-md:bottom-4 max-md:h-[60px] max-md:w-[60px] md:right-6 md:bottom-6 md:h-[68px] md:w-[68px]"
          aria-label="카카오톡으로 상담하기"
        >
          <svg
            viewBox="0 0 40 34"
            className="max-md:h-7 max-md:w-8 md:h-8 md:w-9"
            aria-hidden="true"
          >
            <path
              d="M20 2C10.06 2 2 8.27 2 16c0 4.93 3.3 9.27 8.29 11.76L9 33l6.02-3.48c1.59.32 3.26.48 4.98.48 9.94 0 18-6.27 18-14S29.94 2 20 2Z"
              fill="var(--color-text-primary)"
            />
            <text
              x="20"
              y="19.5"
              textAnchor="middle"
              fill="var(--color-kakao)"
              fontSize="9"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              TALK
            </text>
          </svg>
          <span className="text-[11px] font-bold leading-none">상담하기</span>
        </button>
      )}
    </>
  );
}
