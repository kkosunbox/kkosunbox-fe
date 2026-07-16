export type ShopCategory = "간식" | "껌" | "화식";

/** placeholder 일러스트 글리프 종류 — 실사진 자산 확보 시 image 필드로 교체 */
export type ShopGlyph = "ball" | "stick" | "chip" | "bone" | "riceball" | "bowl";

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  weight: string;
  price: number;
  category: ShopCategory;
  glyph: ShopGlyph;
  colorVar: string;
  badge?: string;
}

export const SHOP_CATEGORIES: Array<"전체" | ShopCategory> = ["전체", "간식", "껌", "화식"];

/**
 * /shop 단건 구매 더미 상품 목록 — 꼬순박스 구성 간식을 낱개 판매하는 컨셉.
 * 실제 상품 API 연동 시 이 배열을 서버 응답으로 교체한다.
 */
export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "yogurt-ball",
    name: "닭가슴살 요거트볼",
    description: "국내산 닭가슴살에 수제 요거트를 입힌 대표 간식",
    weight: "60g",
    price: 8900,
    category: "간식",
    glyph: "ball",
    colorVar: "var(--color-primary)",
    badge: "베스트",
  },
  {
    id: "churu",
    name: "촉촉 츄르",
    description: "기호성 최고, 물처럼 부드러운 수제 츄르",
    weight: "15g × 4개입",
    price: 6900,
    category: "간식",
    glyph: "stick",
    colorVar: "var(--color-plus)",
  },
  {
    id: "seaweed-chip-chicken",
    name: "미역칩 꼬꼬",
    description: "닭고기와 미역을 바삭하게 구운 저칼로리 칩",
    weight: "40g",
    price: 7900,
    category: "간식",
    glyph: "chip",
    colorVar: "var(--color-basic)",
  },
  {
    id: "seaweed-chip-pork",
    name: "미역칩 꿀꿀",
    description: "돼지고기와 미역의 고소한 만남, 바삭한 식감",
    weight: "40g",
    price: 7900,
    category: "간식",
    glyph: "chip",
    colorVar: "var(--color-accent-orange)",
  },
  {
    id: "beef-gum",
    name: "소고기껌",
    description: "100% 소고기로 만든 오래 씹는 건강껌",
    weight: "70g",
    price: 9900,
    category: "껌",
    glyph: "bone",
    colorVar: "var(--color-primary)",
    badge: "베스트",
  },
  {
    id: "milk-gum",
    name: "우유껌",
    description: "치아가 약한 아이도 부담 없는 부드러운 우유껌",
    weight: "50g",
    price: 5900,
    category: "껌",
    glyph: "bone",
    colorVar: "var(--color-plus)",
  },
  {
    id: "kkokko-riceball",
    name: "꼬꼬주먹밥",
    description: "닭고기와 야채를 꾹꾹 눌러 담은 한 입 영양볼",
    weight: "80g",
    price: 8500,
    category: "간식",
    glyph: "riceball",
    colorVar: "var(--color-basic)",
  },
  {
    id: "homemade-meal",
    name: "수제 화식",
    description: "휴먼그레이드 재료로 갓 지은 프리미엄 식사",
    weight: "150g",
    price: 12900,
    category: "화식",
    glyph: "bowl",
    colorVar: "var(--color-accent-orange)",
    badge: "프리미엄",
  },
];

/** 배송 정책 — 3만원 이상 무료배송 */
export const SHOP_FREE_SHIPPING_THRESHOLD = 30000;
export const SHOP_SHIPPING_FEE = 3000;

export function getShopProduct(id: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => p.id === id);
}

export function formatShopPrice(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}
