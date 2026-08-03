import type { StaticImageData } from "next/image";
import purchaseDetail02 from "../assets/purchase-detail-02.webp";
import purchaseDetail03 from "../assets/purchase-detail-03.webp";
import purchaseDetail04 from "../assets/purchase-detail-04.webp";
import purchaseDetail05 from "../assets/purchase-detail-05.webp";
import purchaseDetail06 from "../assets/purchase-detail-06.webp";
import purchaseDetail07 from "../assets/purchase-detail-07.webp";
import standardDetail01 from "../assets/purchase-detail-standard-01.webp";
import standardDetail02 from "../assets/purchase-detail-standard-02.webp";
import standardDetail03 from "../assets/purchase-detail-standard-03.webp";
import standardDetail04 from "../assets/purchase-detail-standard-04.webp";
import standardDetail05 from "../assets/purchase-detail-standard-05.webp";
import standardDetail06 from "../assets/purchase-detail-standard-06.webp";
import basicDetail01 from "../assets/purchase-detail-basic-01.webp";
import basicDetail02 from "../assets/purchase-detail-basic-02.webp";
import basicDetail03 from "../assets/purchase-detail-basic-03.webp";
import basicDetail04 from "../assets/purchase-detail-basic-04.webp";
import basicDetail05 from "../assets/purchase-detail-basic-05.webp";
import basicDetail06 from "../assets/purchase-detail-basic-06.webp";
import type { PackageTier } from "./packageData";

/**
 * 단품 구매 상세페이지 기준 이미지 — 구독/단품 상세페이지가 공유하는 단일 소스.
 * 각 티어 마지막 컷("섭취 및 보관 주의사항")은 성분표시 확정 전까지 임시 제외.
 * 파일: purchase-detail-08 / purchase-detail-standard-07 / purchase-detail-basic-07 (../assets)
 *
 * 이 마지막 컷 안에 "※ 연출된 이미지..." 하단 안내 문구가 포함돼 있었다.
 * 위 3개 파일을 다시 배열에 포함시키는 시점에 ProductInfoImages 하단 disclaimer
 * 문구(중복 노출)를 어떻게 할지 다시 판단할 것.
 */
export const PACKAGE_DETAIL_IMAGES: Record<PackageTier, readonly StaticImageData[]> = {
  Premium: [purchaseDetail02, purchaseDetail03, purchaseDetail04, purchaseDetail05, purchaseDetail06, purchaseDetail07],
  Standard: [standardDetail01, standardDetail02, standardDetail03, standardDetail04, standardDetail05, standardDetail06],
  Basic: [basicDetail01, basicDetail02, basicDetail03, basicDetail04, basicDetail05, basicDetail06],
};
