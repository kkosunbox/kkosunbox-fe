// ── DeliveryAddress ───────────────────────────────────────────────

export interface DeliveryAddress {
  id: number;
  receiverName: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  addressDetail: string | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── 요청 ──────────────────────────────────────────────────────────

export interface CreateDeliveryAddressRequest {
  receiverName: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  addressDetail?: string;
  memo?: string;
}

/** PATCH — 수정할 필드만 전달. addressDetail/memo는 null로 전달 시 초기화. */
export interface UpdateDeliveryAddressRequest {
  receiverName?: string;
  phoneNumber?: string;
  zipCode?: string;
  address?: string;
  addressDetail?: string | null;
  memo?: string | null;
}
