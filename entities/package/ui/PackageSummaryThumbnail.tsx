import type { StaticImageData } from "next/image";
import { PACKAGE_SUMMARY_IMAGE_CLASSNAME } from "../lib/packageSummaryImageClassName";

type PackageSummaryThumbnailProps = {
  src: StaticImageData;
  alt: string;
  className?: string;
};

/** Basic · Standard · Premium 요약 카드 썸네일 — next/image 리사이즈 대신 원본 PNG 직접 표시 */
export function PackageSummaryThumbnail({
  src,
  alt,
  className,
}: PackageSummaryThumbnailProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 요약 카드 썸네일 원본 PNG 품질 유지
    <img
      src={src.src}
      alt={alt}
      width={src.width}
      height={src.height}
      decoding="async"
      className={[PACKAGE_SUMMARY_IMAGE_CLASSNAME, "h-full w-full", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
