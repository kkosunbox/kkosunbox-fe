/**
 * 서버 전용 배송지 데이터 패칭.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import type { DeliveryAddress } from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

export async function fetchDeliveryAddresses(token?: string): Promise<DeliveryAddress[]> {
  const data = await apiClient
    .get<{ addresses: DeliveryAddress[] }>("/v1/delivery-addresses", serverOpts(token))
    .catch(() => ({ addresses: [] as DeliveryAddress[] }));
  return data.addresses;
}
