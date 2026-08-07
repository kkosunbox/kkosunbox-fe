import Image from "next/image";
import authMobileDeco from "@/shared/assets/auth-mobile-deco.webp";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";

/**
 * 로그인·회원가입 모바일 배경.
 * CSS 그라데이션(전체 높이) + 상단 데코(라인·발바닥).
 *
 * 데코는 좁은 화면에서 오른쪽이 잘리도록 제작된 에셋이므로
 * 로고와 겹치지 않게 오른쪽으로 두고, overflow로 우측을 자른다.
 */
export function AuthMobileBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-login-bg)" }}
      />
      {/* 375 프레임 기준: 우측으로 밀어 발바닥이 로고를 가리지 않게 함. 우측 끝은 의도적으로 클립 */}
      <div
        className="absolute top-[49px] h-[235px] w-[426px]"
        style={{ left: "calc(50% - 160px)" }}
      >
        <Image
          src={authMobileDeco}
          alt=""
          fill
          quality={HIGH_IMAGE_QUALITY}
          className="object-cover object-left-top"
          sizes="426px"
          priority
        />
      </div>
    </div>
  );
}
