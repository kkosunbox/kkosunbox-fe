import Image from "next/image";
import authMobileLine from "@/shared/assets/auth-mobile-line.png";
import authMobilePaws from "@/shared/assets/auth-mobile-paws.png";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";

/** 로그인·회원가입 전체 높이의 그라데이션 배경. */
export function AuthMobileBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-login-bg)" }}
      />
    </div>
  );
}

/** 375px 시안의 장식을 콘텐츠에 고정해 화면 높이가 달라도 로고와의 간격을 유지한다. */
export function AuthMobileDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        className="absolute left-[calc(50%-187.5px)] top-[-8px] h-[306px] w-[405px]"
      >
        <Image
          src={authMobileLine}
          alt=""
          fill
          quality={HIGH_IMAGE_QUALITY}
          sizes="405px"
          priority
        />
      </div>
      <Image
        src={authMobilePaws}
        alt=""
        width={49}
        height={56}
        quality={HIGH_IMAGE_QUALITY}
        className="absolute right-[5px] top-[58px] h-[56px] w-[49px]"
        sizes="49px"
        priority
      />
    </div>
  );
}
