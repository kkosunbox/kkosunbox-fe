import type { ProductDto, ProductOrderDto } from "../api/types";

export interface ProductPurchaseGroup {
  productId: number;
  productName: string;
  imageUrl: string | null;
  orderCount: number;
  /** 가장 최근 주문 (createdAt 기준) */
  latestOrder: ProductOrderDto;
  /** 연관 구독 플랜 ID (리뷰 공유용). 매칭 실패 시 null */
  relatedPlanId: number | null;
}

/** 단건 주문 목록을 상품(productId) 기준으로 그룹핑한다. */
export function groupOrdersByProduct(
  orders: ProductOrderDto[],
  products: ProductDto[],
): ProductPurchaseGroup[] {
  const groups = new Map<number, ProductPurchaseGroup>();
  for (const order of orders) {
    const existing = groups.get(order.productId);
    if (existing) {
      existing.orderCount += 1;
      if (order.createdAt > existing.latestOrder.createdAt) {
        existing.latestOrder = order;
      }
      continue;
    }
    const product = products.find((p) => p.id === order.productId);
    groups.set(order.productId, {
      productId: order.productId,
      productName: order.productName,
      imageUrl: product?.imageUrl ?? null,
      orderCount: 1,
      latestOrder: order,
      relatedPlanId: product?.relatedPlanId ?? null,
    });
  }
  return Array.from(groups.values());
}
