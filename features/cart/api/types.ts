export interface CartItemDto {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string | null;
  relatedPlanId?: number | null;
  relatedPlanSlug?: string | null;
  unitPrice: number;
  quantity: number;
  itemAmount: number;
  stockQuantity: number | null;
  isOrderable: boolean;
  unavailableReason?: string | null;
  createdAt: string;
}

export interface CartDto {
  items: CartItemDto[];
  itemCount: number;
  totalQuantity: number;
  itemsAmount: number;
  shippingFee: number;
  estimatedAmount: number;
  freeShippingThreshold: number;
  hasUnorderableItem: boolean;
}

export interface CartCountDto { itemCount: number }
export interface AddCartItemRequest { productId: number; quantity: number }
export interface UpdateCartItemRequest { quantity: number }
export interface CartCheckoutRequest {
  cartItemIds?: number[];
  deliveryAddressId: number;
  couponCode?: string;
}
export interface CartPriceRequest { cartItemIds?: number[]; couponCode?: string }
export interface CartPriceLineDto {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  itemAmount: number;
  allocatedAmount: number;
}
export interface CartPriceDto {
  lines: CartPriceLineDto[];
  totalQuantity: number;
  itemsAmount: number;
  couponDiscountAmount: number;
  discountedItemsAmount: number;
  shippingFee: number;
  amount: number;
}
export interface CartCheckoutDto {
  id: number;
  orderId: string;
  amount: number;
  orderName: string;
  shippingFee: number;
}
