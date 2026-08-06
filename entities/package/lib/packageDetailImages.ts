import type { StaticImageData } from "next/image";
import premiumDetail01 from "../assets/purchase-detail-premium-01.webp";
import premiumDetail02 from "../assets/purchase-detail-premium-02.webp";
import premiumDetail03 from "../assets/purchase-detail-premium-03.webp";
import premiumDetail04 from "../assets/purchase-detail-premium-04.webp";
import premiumDetail05 from "../assets/purchase-detail-premium-05.webp";
import premiumDetail06 from "../assets/purchase-detail-premium-06.webp";
import premiumDetailPromo from "../assets/purchase-detail-premium-promo.webp";
import standardDetail01 from "../assets/purchase-detail-standard-01.webp";
import standardDetail02 from "../assets/purchase-detail-standard-02.webp";
import standardDetail03 from "../assets/purchase-detail-standard-03.webp";
import standardDetail04 from "../assets/purchase-detail-standard-04.webp";
import standardDetail05 from "../assets/purchase-detail-standard-05.webp";
import standardDetail06 from "../assets/purchase-detail-standard-06.webp";
import standardDetailPromo from "../assets/purchase-detail-standard-promo.webp";
import basicDetail01 from "../assets/purchase-detail-basic-01.webp";
import basicDetail02 from "../assets/purchase-detail-basic-02.webp";
import basicDetail03 from "../assets/purchase-detail-basic-03.webp";
import basicDetail04 from "../assets/purchase-detail-basic-04.webp";
import basicDetail05 from "../assets/purchase-detail-basic-05.webp";
import basicDetail06 from "../assets/purchase-detail-basic-06.webp";
import basicDetailPromo from "../assets/purchase-detail-basic-promo.webp";
import feedingGuide from "../assets/purchase-detail-feeding-guide.webp";
import type { PackageTier } from "./packageData";

/**
 * 단품 구매 상세페이지 기준 이미지 — 구독/단품 상세페이지가 공유하는 단일 소스.
 * 파일명은 티어 접두사(premium/standard/basic) + 표시 순서 번호로 통일.
 * 마지막 컷 "섭취 및 보관 주의사항"(feedingGuide)은 티어 무관 공통 문구라 3개 티어가 하나의 파일을 공유한다.
 * 성분표시 이미지 안에 "※ 연출된 이미지..." 문구가 포함돼 있어 ProductInfoImages의
 * 별도 하단 disclaimer 문단은 제거했다 — 중복 노출 방지.
 */
export const PACKAGE_DETAIL_IMAGES: Record<PackageTier, readonly StaticImageData[]> = {
  Premium: [
    premiumDetail01,
    premiumDetail02,
    premiumDetail03,
    premiumDetail04,
    premiumDetail05,
    premiumDetail06,
    feedingGuide,
  ],
  Standard: [standardDetail01, standardDetail02, standardDetail03, standardDetail04, standardDetail05, standardDetail06, feedingGuide],
  Basic: [basicDetail01, basicDetail02, basicDetail03, basicDetail04, basicDetail05, basicDetail06, feedingGuide],
};

/**
 * 단품 구매 상세페이지 전용 — 구독 유도 배너(2번째·3번째 컷 사이)를 추가로 포함.
 * 구독 상세페이지에는 노출하지 않으므로 PACKAGE_DETAIL_IMAGES와 분리.
 */
export const PACKAGE_DETAIL_IMAGES_PURCHASE: Record<PackageTier, readonly StaticImageData[]> = {
  Premium: [
    premiumDetail01,
    premiumDetail02,
    premiumDetailPromo,
    premiumDetail03,
    premiumDetail04,
    premiumDetail05,
    premiumDetail06,
    feedingGuide,
  ],
  Standard: [
    standardDetail01,
    standardDetail02,
    standardDetailPromo,
    standardDetail03,
    standardDetail04,
    standardDetail05,
    standardDetail06,
    feedingGuide,
  ],
  Basic: [
    basicDetail01,
    basicDetail02,
    basicDetailPromo,
    basicDetail03,
    basicDetail04,
    basicDetail05,
    basicDetail06,
    feedingGuide,
  ],
};
