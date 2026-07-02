import Image from "next/image";
import Link from "next/link";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import notFoundImage from "@/public/images/404-not-found.webp";

export default function NotFoundSection() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-54px)] bg-[var(--color-surface-light)]">
      <div className="flex flex-col items-center">
        {/* 404 NOT FOUND 이미지 — 웹 240×151, 모바일 180 auto */}
        <Image
          src={notFoundImage}
          alt="404 Not Found"
          width={240}
          height={151}
          quality={HIGH_IMAGE_QUALITY}
          className="max-md:w-[180px] max-md:h-auto"
          priority
        />

        {/* 서브텍스트 — 이미지 하단 11px, Figma Sub test #999999 */}
        <p className="mt-[11px] text-center text-[16px] font-medium leading-[19px] tracking-[-0.114286px] text-[var(--color-text-secondary)]">
          요청하신 페이지를 찾을 수 없습니다.
        </p>

        {/* 버튼 — 서브텍스트 하단 44px, Brown #584B40 */}
        <Link
          href="/"
          className="mt-11 flex h-12 w-[360px] items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] px-[10px] text-[16px] font-semibold leading-[140%] tracking-[0.2px] text-white transition-opacity hover:opacity-90 active:opacity-80"
        >
          처음으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
