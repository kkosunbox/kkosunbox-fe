import { getProduct, getProducts, quoteGuestOrder, type GuestOrderLine, type ProductDto } from "@/features/product/api";
import { ApiError } from "@/shared/lib/api";
import type { CartDto, CartItemDto, CartPriceDto } from "../api/types";
import { notifyCartUpdated } from "./events";

/**
 * 비회원 장바구니 — 브라우저 localStorage에만 보관한다.
 *
 * 서버 장바구니(`/v1/cart`)는 회원 전용이라, 비회원은 `{ productId, quantity }`만 저장하고
 * 화면에 필요한 상품 정보·주문 가능 여부는 공개 상품 API로 매번 다시 계산한다.
 * 반환 타입은 서버 장바구니와 같은 `CartDto`/`CartPriceDto`로 맞춰 화면 코드를 공유한다.
 * 담기·수량 검증 규칙도 서버(`CartService`)와 동일하게 둔다.
 */

const STORAGE_KEY = "ggosoonbox_guest_cart";
export const MAX_CART_ITEM_QUANTITY = 99;

interface StoredGuestCartItem {
  id: number;
  productId: number;
  quantity: number;
  createdAt: string;
}

function isStoredItem(value: unknown): value is StoredGuestCartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    Number.isInteger(item.id) &&
    Number.isInteger(item.productId) &&
    Number.isInteger(item.quantity) &&
    (item.quantity as number) >= 1 &&
    (item.quantity as number) <= MAX_CART_ITEM_QUANTITY &&
    typeof item.createdAt === "string"
  );
}

function readItems(): StoredGuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isStoredItem) : [];
  } catch {
    return [];
  }
}

function writeItems(items: StoredGuestCartItem[]) {
  try {
    if (items.length === 0) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 저장소 차단(사파리 프라이빗 등) — 담기 자체는 실패로 처리하지 않는다.
  }
  notifyCartUpdated();
}

/** 다른 탭에서 비회원 장바구니가 바뀌었는지 판별 (`storage` 이벤트용) */
export function isGuestCartStorageEvent(event: StorageEvent) {
  return event.key === STORAGE_KEY || event.key === null;
}

export function getGuestCartCount() {
  return readItems().length;
}

function productNotFound() {
  return new ApiError(404, "PRODUCT_NOT_FOUND", "상품을 찾을 수 없습니다.");
}

function hasEnoughStock(product: ProductDto, quantity: number) {
  return product.stockQuantity == null || product.stockQuantity >= quantity;
}

/** 서버 `findOrderableProduct` + `validateStockForQuantity`와 같은 규칙 */
async function assertOrderable(productId: number, quantity: number) {
  const product = await getProduct(productId).catch((err: unknown) => {
    if (err instanceof ApiError && err.isNotFound) throw productNotFound();
    throw err;
  });
  if (product.isSalesPaused) throw new ApiError(400, "PRODUCT_SALES_PAUSED", "판매가 일시 중단된 상품입니다.");
  if (!hasEnoughStock(product, quantity)) throw new ApiError(409, "PRODUCT_OUT_OF_STOCK", "재고가 부족합니다.");
}

function resolveUnavailableReason(product: ProductDto | undefined, quantity: number): string | null {
  if (!product) return "판매가 종료된 상품입니다.";
  if (product.isSalesPaused) return "판매가 일시 중단된 상품입니다.";
  if (!hasEnoughStock(product, quantity)) {
    return product.stockQuantity === 0
      ? "품절된 상품입니다."
      : `재고가 부족합니다. (남은 수량 ${product.stockQuantity}개)`;
  }
  return null;
}

/** 담기 — 이미 담긴 상품이면 수량을 합산하고 99개로 제한한다 */
export async function addGuestCartItem(productId: number, quantity: number): Promise<CartDto> {
  const items = readItems();
  const existing = items.find((item) => item.productId === productId);
  const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, MAX_CART_ITEM_QUANTITY);
  await assertOrderable(productId, nextQuantity);
  const latest = readItems();
  const target = latest.find((item) => item.productId === productId);
  if (target) {
    target.quantity = nextQuantity;
    writeItems(latest);
  } else {
    const nextId = latest.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    writeItems([...latest, { id: nextId, productId, quantity: nextQuantity, createdAt: new Date().toISOString() }]);
  }
  return getGuestCart();
}

export async function updateGuestCartItem(id: number, quantity: number): Promise<CartDto> {
  const items = readItems();
  const target = items.find((item) => item.id === id);
  if (!target) throw new ApiError(404, "CART_ITEM_NOT_FOUND", "장바구니 상품을 찾을 수 없습니다.");
  await assertOrderable(target.productId, quantity);
  target.quantity = quantity;
  writeItems(items);
  return getGuestCart();
}

export async function deleteGuestCartItem(id: number): Promise<void> {
  writeItems(readItems().filter((item) => item.id !== id));
}

let mergePromise: Promise<boolean> | null = null;

/**
 * 로그인 직후 비회원 장바구니를 서버 장바구니로 합친다.
 * 서버 담기 규칙(같은 상품 합산·99개 제한)을 그대로 따르고, 담을 수 없는 상품(품절·판매 종료)은 건너뛴다.
 * 시도한 뒤에는 결과와 관계없이 브라우저 장바구니를 비운다 — 남겨두면 회원 화면에서 보이지 않는 채로 매번 재시도된다.
 * @returns 서버 장바구니가 바뀌었는지
 */
export function mergeGuestCartIntoMember(add: (productId: number, quantity: number) => Promise<unknown>) {
  if (mergePromise) return mergePromise;
  const items = readItems();
  if (items.length === 0) return Promise.resolve(false);
  mergePromise = (async () => {
    const results = await Promise.allSettled(items.map((item) => add(item.productId, item.quantity)));
    writeItems([]);
    return results.some((result) => result.status === "fulfilled");
  })().finally(() => { mergePromise = null; });
  return mergePromise;
}

/** 비회원 결제 완료 후 주문한 항목만 장바구니에서 지운다 */
export function removeGuestCartItems(ids: number[]) {
  const removing = new Set(ids);
  writeItems(readItems().filter((item) => !removing.has(item.id)));
}

/** 선택한 장바구니 항목 → 비회원 주문 API `lines` */
export function getGuestCartLines(ids?: number[]): GuestOrderLine[] {
  const picked = ids ? new Set(ids) : null;
  return readItems()
    .filter((item) => !picked || picked.has(item.id))
    .map(({ productId, quantity }) => ({ productId, quantity }));
}

export async function getGuestCart(): Promise<CartDto> {
  const stored = readItems();
  const products = stored.length > 0 ? (await getProducts()).products : [];
  const productMap = new Map(products.map((product) => [product.id, product]));

  const items: CartItemDto[] = stored.map((item) => {
    const product = productMap.get(item.productId);
    const unavailableReason = resolveUnavailableReason(product, item.quantity);
    const unitPrice = product?.price ?? 0;
    return {
      id: item.id,
      productId: item.productId,
      productName: product?.name ?? "판매 종료 상품",
      imageUrl: product?.imageUrl ?? null,
      relatedPlanId: product?.relatedPlanId ?? null,
      relatedPlanSlug: product?.relatedPlanSlug ?? null,
      unitPrice,
      quantity: item.quantity,
      itemAmount: unitPrice * item.quantity,
      stockQuantity: product?.stockQuantity ?? null,
      isOrderable: unavailableReason === null,
      unavailableReason,
      createdAt: item.createdAt,
    };
  });

  const orderable = items.filter((item) => item.isOrderable);
  const itemsAmount = orderable.reduce((sum, item) => sum + item.itemAmount, 0);
  // 배송비·무료배송 기준은 서버 정책을 따르므로 비회원 견적 API로 받는다. 견적 실패가 장바구니 표시를 막지 않게 한다.
  const { shippingFee, freeShippingThreshold } = orderable.length > 0
    ? await quoteGuestOrder({ lines: orderable.map(({ productId, quantity }) => ({ productId, quantity })) })
      .catch(() => ({ shippingFee: 0, freeShippingThreshold: 0 }))
    : { shippingFee: 0, freeShippingThreshold: 0 };

  return {
    items,
    itemCount: items.length,
    totalQuantity: orderable.reduce((sum, item) => sum + item.quantity, 0),
    itemsAmount,
    shippingFee,
    estimatedAmount: itemsAmount + shippingFee,
    freeShippingThreshold,
    hasUnorderableItem: items.some((item) => !item.isOrderable),
  };
}

export async function quoteGuestCart(ids: number[]): Promise<CartPriceDto> {
  const quote = await quoteGuestOrder({ lines: getGuestCartLines(ids) });
  return {
    lines: quote.lines,
    totalQuantity: quote.totalQuantity,
    itemsAmount: quote.itemsAmount,
    couponDiscountAmount: quote.couponDiscountAmount,
    discountedItemsAmount: quote.discountedItemsAmount,
    shippingFee: quote.shippingFee,
    amount: quote.amount,
  };
}
