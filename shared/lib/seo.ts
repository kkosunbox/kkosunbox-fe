import type { Metadata } from "next";

/** 검색엔진에 알리는 유일한 정식 프로덕션 주소. */
export const SITE_URL = "https://www.kkosunbox.com";

/** 정식 프로덕션 호스트명. dev.kkosunbox.com·preview·localhost 등과 구분하는 기준. */
export const PRODUCTION_HOST = new URL(SITE_URL).hostname;

/**
 * 검색엔진 색인 제외(noindex, nofollow).
 * 검색 노출 대상이 아닌 페이지(가입·로그인·마이페이지·주문·결제 등)에 사용한다.
 * 로그인·마이페이지·주문·결제 등 검색 노출 대상이 아닌 기능성 페이지에 사용한다.
 */
export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};

/** 내부 링크는 따라가되 검색 결과에는 노출하지 않는 공개 보조 문서용 정책. */
export const NOINDEX_FOLLOW_METADATA: Metadata = {
  robots: { index: false, follow: true },
};

/**
 * 배송 정책(Product 구조화 데이터용). /support 배송·교환·반품 안내와 동일 내용.
 * 배송비 무료·전국 배송·결제 후 1~3일 이내 출고만 표준 필드로 정확히 표현 가능해
 * transitTime(택배사 배송 소요일)은 정보가 없어 제외했다.
 */
export const PRODUCT_SHIPPING_DETAILS_JSONLD = {
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "KRW" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "KR" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
  },
};

/**
 * 반품 정책(Product 구조화 데이터용).
 * 단순 변심 반품은 불가하지만 제품 하자·배송 중 파손은 무료 교환/환불 대상이다.
 * schema.org MerchantReturnPolicy는 "며칠 이내 자유 반품" 구조라 이 조건부 예외를
 * 표현할 필드가 없다 — 하자 시 예외까지 넣으면 실제보다 관대한 정책으로 왜곡되므로,
 * 전체 정책 기준(단순 변심 반품 불가)만 정직하게 MerchantReturnNotPermitted로 표시한다.
 */
export const PRODUCT_RETURN_POLICY_JSONLD = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "KR",
  returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
};
