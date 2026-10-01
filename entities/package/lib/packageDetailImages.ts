import type { StaticImageData } from "next/image";
import premiumDetail01 from "../assets/package-premium-detail-001.png";
import premiumDetail02 from "../assets/package-premium-detail-002.png";
import premiumDetail03 from "../assets/package-premium-detail-003.png";
import premiumDetail04 from "../assets/package-premium-detail-004.png";
import premiumDetail05 from "../assets/package-premium-detail-005.png";
import premiumDetail06 from "../assets/package-premium-detail-006.png";
import commonDetail01 from "../assets/product-detail-common-01.png";
import commonDetail02 from "../assets/product-detail-common-02.png";
import commonDetail02Gif from "../assets/product-detail-common-02-gif.gif";
import commonDetail04 from "../assets/product-detail-common-04.png";
import commonDetail05 from "../assets/product-detail-common-05.png";
import standardDetail01 from "../assets/package-standard-detail-001.png";
import standardDetail02 from "../assets/package-standard-detail-002.png";
import standardDetail03 from "../assets/package-standard-detail-003.png";
import standardDetail04 from "../assets/package-standard-detail-004.png";
import standardDetail05 from "../assets/package-standard-detail-005.png";
import standardDetail06 from "../assets/package-standard-detail-006.png";
import basicDetail01 from "../assets/package-basic-detail-001.png";
import basicDetail02 from "../assets/package-basic-detail-002.png";
import basicDetail03 from "../assets/package-basic-detail-003.png";
import basicDetail04 from "../assets/package-basic-detail-004.png";
import basicDetail05 from "../assets/package-basic-detail-005.png";
import basicDetail06 from "../assets/package-basic-detail-006.png";
import type { PackageTier } from "./packageData";

export const PACKAGE_DETAIL_COMMON_IMAGES = {
  concern: commonDetail01,
  brandIntro: commonDetail02,
  reactionGif: commonDetail02Gif,
  ingredients: commonDetail04,
  freeFrom: commonDetail05,
} as const satisfies Record<string, StaticImageData>;

const PREMIUM_DETAIL_IMAGES = [
  premiumDetail01,
  PACKAGE_DETAIL_COMMON_IMAGES.concern,
  PACKAGE_DETAIL_COMMON_IMAGES.brandIntro,
  PACKAGE_DETAIL_COMMON_IMAGES.reactionGif,
  premiumDetail06,
  PACKAGE_DETAIL_COMMON_IMAGES.ingredients,
  PACKAGE_DETAIL_COMMON_IMAGES.freeFrom,
  premiumDetail02,
  premiumDetail03,
  premiumDetail04,
  premiumDetail05,
] as const satisfies readonly StaticImageData[];

const STANDARD_DETAIL_IMAGES = [
  standardDetail01,
  PACKAGE_DETAIL_COMMON_IMAGES.concern,
  PACKAGE_DETAIL_COMMON_IMAGES.brandIntro,
  PACKAGE_DETAIL_COMMON_IMAGES.reactionGif,
  standardDetail02,
  PACKAGE_DETAIL_COMMON_IMAGES.ingredients,
  PACKAGE_DETAIL_COMMON_IMAGES.freeFrom,
  standardDetail03,
  standardDetail04,
  standardDetail05,
  standardDetail06,
] as const satisfies readonly StaticImageData[];

const BASIC_DETAIL_IMAGES = [
  basicDetail01,
  PACKAGE_DETAIL_COMMON_IMAGES.concern,
  PACKAGE_DETAIL_COMMON_IMAGES.brandIntro,
  PACKAGE_DETAIL_COMMON_IMAGES.reactionGif,
  basicDetail02,
  PACKAGE_DETAIL_COMMON_IMAGES.ingredients,
  PACKAGE_DETAIL_COMMON_IMAGES.freeFrom,
  basicDetail03,
  basicDetail04,
  basicDetail05,
  basicDetail06,
] as const satisfies readonly StaticImageData[];

/**
 * 단품 구매 상세페이지 기준 이미지 — 구독/단품 상세페이지가 공유하는 단일 소스.
 * 파일명은 티어 접두사(premium/standard/basic) + 표시 순서 번호로 통일.
 * 각 패키지는 단품 상품 상세에서 사용하던 공통 이미지/GIF와 신규 전용 이미지를 같은 흐름으로 조합한다.
 * 성분표시 이미지 안에 "※ 연출된 이미지..." 문구가 포함돼 있어 ProductInfoImages의
 * 별도 하단 disclaimer 문단은 제거했다 — 중복 노출 방지.
 */
export const PACKAGE_DETAIL_IMAGES: Record<PackageTier, readonly StaticImageData[]> = {
  Premium: PREMIUM_DETAIL_IMAGES,
  Standard: STANDARD_DETAIL_IMAGES,
  Basic: BASIC_DETAIL_IMAGES,
};

/**
 * 단품 구매 상세페이지용 배열.
 * 모든 패키지가 신규 시안에 따라 구독 상세와 같은 흐름을 사용한다.
 */
export const PACKAGE_DETAIL_IMAGES_PURCHASE: Record<PackageTier, readonly StaticImageData[]> = {
  Premium: PREMIUM_DETAIL_IMAGES,
  Standard: STANDARD_DETAIL_IMAGES,
  Basic: BASIC_DETAIL_IMAGES,
};
