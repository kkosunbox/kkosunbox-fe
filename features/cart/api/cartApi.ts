import { apiClient } from "@/shared/lib/api";
import type { AddCartItemRequest, CartCheckoutDto, CartCheckoutRequest, CartCountDto, CartDto, CartPriceDto, CartPriceRequest, UpdateCartItemRequest } from "./types";

export const getCart = () => apiClient.get<CartDto>("/v1/cart");
export const getCartCount = () => apiClient.get<CartCountDto>("/v1/cart/count");
export const addCartItem = (body: AddCartItemRequest) => apiClient.post<CartDto>("/v1/cart/items", body);
export const updateCartItem = (id: number, body: UpdateCartItemRequest) => apiClient.patch<CartDto>(`/v1/cart/items/${id}`, body);
export const deleteCartItem = (id: number) => apiClient.delete<CartDto>(`/v1/cart/items/${id}`);
export const clearCart = () => apiClient.delete<CartDto>("/v1/cart");
export const quoteCart = (body: CartPriceRequest) => apiClient.post<CartPriceDto>("/v1/cart/checkout/price", body);
export const checkoutCart = (body: CartCheckoutRequest) => apiClient.post<CartCheckoutDto>("/v1/cart/checkout", body);
