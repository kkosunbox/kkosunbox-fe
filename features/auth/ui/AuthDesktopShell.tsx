"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import authBanner from "@/shared/assets/auth-banner-renewal.png";
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
  /** 탭 하단 ~ 헤딩 상단 간격(px). 페이지별 실측값이 다를 수 있어 기본값(52, 로그인 기준)을 유지하고 필요한 페이지만 덮어쓴다. */
  tabsGapPx = 52,
  children,
}: {
  /** 로그인/회원가입 전환 탭 — 생략하면 탭 없이 헤딩이 카드 맨 위에 온다 (비밀번호 찾기 등) */
  active?: AuthTabKey;
  headingTop: string;
  headingBottom: string;
  contentGapPx: number;
  tabsGapPx?: number;
  children: ReactNode;
}) {
  return (
    // 1920px 시안 기준: 좌측 753×733, 간격 43, 우측 753×837을 한 묶음으로 중앙 정렬한다.
    // 1200~1548px 구간에서는 폼의 최소 너비(401px)를 지키며 배너와 간격만 유연하게 줄인다.
    <div className="max-lg:hidden lg:flex lg:min-h-svh lg:items-center lg:justify-center lg:px-10 lg:py-[75px] min-[1800px]:pl-[229px] min-[1800px]:pr-[142px]">
      <div className="mx-auto flex w-full max-w-[1549px] items-center gap-[clamp(24px,2.24vw,43px)]">
        <Link
          href="/"
          aria-label="꼬순박스 메인으로 이동"
          className="relative block aspect-[753/733] min-w-0 max-w-[753px] grow basis-[753px] overflow-hidden rounded-[24px]"
        >
          <Image
            src={authBanner}
            alt=""
            aria-hidden="true"
            fill
            quality={HIGH_IMAGE_QUALITY}
            className="object-cover object-center"
            sizes="753px"
            priority
          />
          <div
            className="absolute left-[56px] top-[41px]"
            style={{ fontFamily: AUTH_HEADING_FONT }}
          >
            <h2 className="h-[46px] w-[368px] text-[32px] font-extrabold leading-[46px] tracking-[-0.04em] text-[var(--color-why-choose-text)] capitalize">
              우리 아이를 위한 맞춤 건강간식
            </h2>
            <p
              className="mt-3 h-[50px] w-[248px] text-[14px] font-bold leading-[180%] tracking-[-0.04em] text-white"
              style={{
                textShadow: "2px 4px 8px rgba(252, 226, 206, 0.2)",
              }}
            >
              매일 신선하게 만드는 휴먼 그레이드 수제 간식을
              <br />
              정기구독으로 편하게 받아보세요.
            </p>
          </div>
        </Link>

        {/* 우측 카드의 외곽은 최대 753px, 실제 입력 콘텐츠는 시안대로 401px로 유지한다. */}
        <div className="flex min-h-[837px] min-w-[401px] max-w-[753px] grow shrink-[6] basis-[753px] flex-col items-center justify-center rounded-[40px] bg-white">
          <div className="w-full max-w-[401px]">
            {active && <AuthTabs active={active} />}

            <div
              className="text-center"
              style={active ? { marginTop: tabsGapPx } : undefined}
            >
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
