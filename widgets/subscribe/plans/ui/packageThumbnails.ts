import type { StaticImageData } from "next/image";
import boxMockupBasic from "../assets/box-mockup-basic.png";
import boxMockupStandard from "../assets/box-mockup-standard.png";
import boxMockupPremium from "../assets/box-mockup-premium.png";
import packageThumbnailBasic from "../assets/package-thumbnail-basic.png";
import packageThumbnailPremium from "../assets/package-thumbnail-premium.png";
import packageThumbnailStandard from "../assets/package-thumbnail-standard.png";
import type { PackageTier } from "./packageData";

export const TIER_THUMBNAILS: Record<PackageTier, StaticImageData> = {
  Basic: boxMockupBasic,
  Standard: boxMockupStandard,
  Premium: boxMockupPremium,
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
