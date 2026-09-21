"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
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
          className="kakao-widget-enter group fixed bottom-4 right-3 z-[50] h-[86px] w-[86px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cta-button)] md:bottom-6 md:right-6"
          aria-label="카카오톡으로 상담하기"
        >
          <span className="block h-full w-full drop-shadow-[0_6px_20px_rgba(78,78,78,0.32)] transition-transform duration-200 group-hover:scale-[1.025] group-active:scale-[0.98]">
            <span className="kakao-speech-float absolute -left-2 -top-1.5 z-10 h-10 w-[102px]">
              <Image src="/images/kakao-consult-bubble.png" alt="" fill sizes="102px" className="object-contain" priority />
            </span>
            <span className="absolute bottom-0 left-[13px] h-[60px] w-[60px] rounded-full bg-[var(--color-cta-button)]">
              <span className="absolute inset-0.5 overflow-hidden rounded-full bg-white">
                <Image src="/images/kakao-consult-dog.png" alt="" fill sizes="56px" className="object-cover object-[center_43%]" priority />
              </span>
            </span>
          </span>
        </button>
      )}
    </>
  );
}
