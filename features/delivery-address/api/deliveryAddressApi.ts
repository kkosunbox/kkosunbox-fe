import { apiClient } from "@/shared/lib/api";
import type {
  CreateDeliveryAddressRequest,
  DeliveryAddress,
  UpdateDeliveryAddressRequest,
} from "./types";

/** 내 배송지 목록 조회 */
export function getDeliveryAddresses() {
  return apiClient.get<{ addresses: DeliveryAddress[] }>(
    "/v1/delivery-addresses",
  );
}

/** 배송지 등록 */
export function createDeliveryAddress(body: CreateDeliveryAddressRequest) {
  return apiClient.post<DeliveryAddress>("/v1/delivery-addresses", body);
}

/** 특정 배송지 조회 */
export function getDeliveryAddress(addressId: number) {
  return apiClient.get<DeliveryAddress>(`/v1/delivery-addresses/${addressId}`);
}

/** 배송지 수정 */
export function updateDeliveryAddress(
  addressId: number,
  body: UpdateDeliveryAddressRequest,
) {
  return apiClient.patch<DeliveryAddress>(
    `/v1/delivery-addresses/${addressId}`,
    body,
  );
}

/** 배송지 삭제 */
export function deleteDeliveryAddress(addressId: number) {
  return apiClient.delete<void>(`/v1/delivery-addresses/${addressId}`);
}
