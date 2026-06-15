import type { StaticImageData } from "next/image";
import boxMockupBasic from "../assets/box-mockup-basic.webp";
import boxMockupStandard from "../assets/box-mockup-standard.webp";
import boxMockupPremium from "../assets/box-mockup-premium.webp";
import packageThumbnailBasic from "../assets/package-thumbnail-basic.webp";
import packageThumbnailPremium from "../assets/package-thumbnail-premium.webp";
import packageThumbnailStandard from "../assets/package-thumbnail-standard.webp";
import packageImageBasic from "../assets/package-image-basic.webp";
import packageImageStandard from "../assets/package-image-standard.webp";
import packageImagePremium from "../assets/package-image-premium.webp";
import type { PackageTier } from "./packageData";

/** @deprecated box-mockup 이미지 — 신규 사용처에는 TIER_BOX_IMAGES 사용 */
export const TIER_THUMBNAILS: Record<PackageTier, StaticImageData> = {
  Basic: boxMockupBasic,
  Standard: boxMockupStandard,
  Premium: boxMockupPremium,
};

/** 최신 박스 이미지 — 주문·구독 관리 카드 썸네일용 */
export const TIER_BOX_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageImageBasic,
  Standard: packageImageStandard,
  Premium: packageImagePremium,
};

/** /subscribe/detail 상단 대표 상품 이미지 */
export const TIER_DETAIL_HERO_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageThumbnailBasic,
  Standard: packageThumbnailStandard,
  Premium: packageThumbnailPremium,
};

/** Real mockups: extra headroom above the box — bias `object-position` for a tighter crop. */
export const TIER_THUMBNAIL_IMAGE_CLASS =
  "object-cover object-[center_58%]" as const;
