// ── DeliveryAddress ───────────────────────────────────────────────

export interface DeliveryAddress {
  id: number;
  nickname: string | null;
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
  nickname?: string;
  receiverName: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  addressDetail?: string;
  memo?: string;
}

/** PATCH — 수정할 필드만 전달. nickname/addressDetail/memo는 null로 전달 시 초기화. */
export interface UpdateDeliveryAddressRequest {
  nickname?: string | null;
  receiverName?: string;
  phoneNumber?: string;
  zipCode?: string;
  address?: string;
  addressDetail?: string | null;
  memo?: string | null;
}
