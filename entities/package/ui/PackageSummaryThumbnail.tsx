import Image, { type StaticImageData } from "next/image";
import { PACKAGE_SUMMARY_IMAGE_CLASSNAME } from "../lib/packageSummaryImageClassName";

type PackageSummaryThumbnailProps = {
  src: StaticImageData;
  alt: string;
  className?: string;
  /** 표시 슬롯 폭. 기본값은 전 소비처 최대 슬롯(ChecklistResult ~272px)을 덮어 under-serve(흐려짐) 방지. */
  sizes?: string;
};

/**
 * Basic · Standard · Premium 요약 카드 썸네일.
 * 원본은 1600×1484지만 실제 표시폭은 ~128–272px라, next/image로 슬롯에 맞춰 리사이즈한다(잉여 픽셀만 제거).
 * quality는 예외적으로 100 — 기존 plain <img>가 원본 webp를 재인코딩 없이 표시했어서,
 * q90 재인코딩이 만들 수 있는 미세한 softening을 차단해 화질 불가침을 보장한다. (디자인·치수 불변)
 */
export function PackageSummaryThumbnail({
  src,
  alt,
  className,
  sizes = "(min-width: 768px) 272px, 172px",
}: PackageSummaryThumbnailProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      quality={100}
      sizes={sizes}
      className={[PACKAGE_SUMMARY_IMAGE_CLASSNAME, "h-full w-full", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
