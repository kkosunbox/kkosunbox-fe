"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import authBanner from "@/shared/assets/auth-banner.webp";
import authBannerHeading from "../assets/auth-banner-heading.svg";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { AuthTabs, type AuthTabKey } from "./AuthTabs";

/** @font-face 로드 전에도 폭이 비슷하게 나오도록, FOUT 시 줄바꿈 점프 완화 */
const AUTH_HEADING_FONT =
  '"Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

/**
 * 로그인·회원가입 데스크톱(lg+) 전용 셸.
 * 좌측 배너 + 우측 흰 카드(탭 전환 + 헤딩 + children 폼)를 구성한다.
 * lg 미만은 각 페이지가 자체 모바일 레이아웃을 그대로 유지하므로 이 컴포넌트는 lg+에서만 보인다.
 */
export function AuthDesktopShell({
  active,
  headingTop,
  headingBottom,
  /** 헤딩 하단 ~ 폼 시작 간격(px). 로그인·회원가입 피그마 실측값이 서로 달라 페이지별로 주입받는다. */
  contentGapPx,
  children,
}: {
  active: AuthTabKey;
  headingTop: string;
  headingBottom: string;
  contentGapPx: number;
  children: ReactNode;
}) {
  return (
    // 1920 HD 기준 블록(max-w 1804 + 좌우 48px)을 뷰포트 가로·세로 중앙에 둔다.
    // 더 넓은 모니터에서도 상단 치우침 없이 가운데 유지. 뷰포트가 콘텐츠보다 짧으면 py-10으로 스크롤 여유.
    // 좌우 여백 48px(px-12) — 1804px 도달 전까지 바깥 여백이 콘텐츠를 밀어주고,
    // 뷰포트가 1804+96(=1900)px를 넘으면 max-w-[1804px]가 먼저 막아서 더는 안 벌어진다.
    <div className="max-lg:hidden lg:flex lg:min-h-svh lg:items-center lg:justify-center lg:px-12 lg:py-10">
      <div className="mx-auto flex w-full max-w-[1804px] items-stretch gap-6">
        {/* 좌측 — 배너. 높이 837px 고정, 너비 702~890px 가변. 뷰포트가 좁아질 때 우측 폼보다
            천천히(shrink-[1]) 줄어들도록 — 좌상단 문구가 화면 밖으로 밀리지 않게 한다 */}
        <div className="relative h-[837px] min-w-[702px] max-w-[890px] grow shrink-[1] basis-[890px] overflow-hidden rounded-[40px]">
          <Image
            src={authBanner}
            alt=""
            aria-hidden="true"
            fill
            quality={HIGH_IMAGE_QUALITY}
            className="object-cover object-center"
            sizes="890px"
            priority
          />
          {/* 헤딩 문구 — 좌상단 기준 left 48px / top 40px 고정 배치 */}
          {/* eslint-disable-next-line @next/next/no-img-element -- 벡터 SVG, Next/Image 재인코딩 불필요 */}
          <img
            src={authBannerHeading.src}
            alt="우리 아이를 위한 맞춤 건강간식, 꼬순박스"
            width={authBannerHeading.width}
            height={authBannerHeading.height}
            className="absolute left-[48px] top-[40px]"
          />
        </div>

        {/* 우측 — 탭 + 폼 카드. 카드 자체는 401~890px 가변, 내부 콘텐츠(입력·버튼)는 401px로 고정·중앙정렬.
            좌측 배너보다 훨씬 빠르게(shrink-[6]) 줄어들어 401px 바닥에 먼저 도달한다 */}
        <div className="flex min-w-[401px] max-w-[890px] grow shrink-[6] basis-[890px] flex-col items-center justify-center rounded-[40px] bg-white">
          <div className="w-full max-w-[401px]">
            <AuthTabs active={active} />

            <div className="mt-[52px] text-center">
              <p
                className="text-[16px] leading-[140%] tracking-[-0.04em] text-primary"
                style={{ fontFamily: AUTH_HEADING_FONT, fontWeight: 600, textShadow: "2px 4px 8px rgba(252, 226, 206, 0.2)" }}
              >
                {headingTop}
              </p>
              <p
                className="mt-1.5 text-[20px] leading-[140%] tracking-[-0.02em] text-[var(--color-text)]"
                style={{ fontFamily: AUTH_HEADING_FONT, fontWeight: 700 }}
              >
                {headingBottom}
              </p>
            </div>

            <div style={{ marginTop: contentGapPx }}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
