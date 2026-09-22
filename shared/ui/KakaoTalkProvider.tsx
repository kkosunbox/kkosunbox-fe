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
          className="kakao-widget-enter group fixed bottom-[14px] right-[15px] z-[50] h-[149px] w-[168.81px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cta-button)]"
          aria-label="카카오톡으로 상담하기"
        >
          <span className="block h-full w-full drop-shadow-[0_6px_20px_rgba(78,78,78,0.32)] transition-transform duration-200 group-hover:scale-[1.025] group-active:scale-[0.98]">
            <span className="kakao-speech-float absolute left-0 top-0 z-10 h-[48.42px] w-[168.81px]">
              <Image src="/images/kakao-consult-bubble.png" alt="" fill sizes="169px" className="object-contain" priority />
            </span>
            <span className="absolute left-[46px] top-[53px] h-[96px] w-[96px] rounded-full bg-[var(--color-cta-button)]">
              <span className="absolute left-1/2 top-1/2 h-[88px] w-[88px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full">
                <Image src="/images/kakao-consult-dog.png" alt="" fill sizes="88px" className="object-cover object-[center_43%]" priority />
              </span>
            </span>
          </span>
        </button>
      )}
    </>
  );
}
