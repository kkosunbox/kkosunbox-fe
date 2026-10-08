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

export function openKakaoChannelChat() {
  if (!CHANNEL_PUBLIC_ID) return;
  window.Kakao?.Channel.chat({ channelPublicId: CHANNEL_PUBLIC_ID });
}

/**
 * 단품몰 내 패키지 바텀시트가 열려 있으면(<html data-package-sheet="open">) 버튼을 숨긴다.
 * 버튼 자체는 등장 애니메이션(fill: both)이 opacity를 고정하므로, 안쪽을 흐리게 하고 버튼은 visibility로 가린다.
 */
const HIDDEN_WHILE_PACKAGE_SHEET = "[html[data-package-sheet=open]_&]:invisible";
const FADE_WHILE_PACKAGE_SHEET = "[html[data-package-sheet=open]_&]:opacity-0";

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
          onClick={openKakaoChannelChat}
          className={`kakao-widget-enter group fixed bottom-4 right-3 z-[50] h-[86px] w-[86px] transition-[visibility] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cta-button)] md:bottom-6 md:right-6 ${HIDDEN_WHILE_PACKAGE_SHEET}`}
          aria-label="카카오톡으로 상담하기"
        >
          <span className={`block h-full w-full drop-shadow-[0_6px_20px_rgba(78,78,78,0.32)] transition-[transform,opacity] duration-200 group-hover:scale-[1.025] group-active:scale-[0.98] motion-reduce:transition-none ${FADE_WHILE_PACKAGE_SHEET}`}>
            <span className="kakao-speech-float absolute left-1/2 top-[-17.125px] z-10 h-[63.25px] w-[162.15px] -translate-x-1/2 max-md:top-[-12.844px] max-md:h-[47.438px] max-md:w-[121.613px]">
              <Image src="/images/kakao-consult-bubble.png" alt="" fill sizes="(max-width: 767px) 122px, 163px" className="object-contain" priority />
            </span>
            <span className="absolute bottom-0 left-[13px] h-[60px] w-[60px] rounded-full bg-[var(--color-cta-button)]">
              <span className="absolute inset-0.5 overflow-hidden rounded-full bg-white">
                <Image src="/images/kakao-consult-dog.jpg" alt="" fill sizes="56px" className="translate-y-[2px] scale-[1.3] object-cover object-[center_34%]" priority />
              </span>
            </span>
          </span>
        </button>
      )}
    </>
  );
}
