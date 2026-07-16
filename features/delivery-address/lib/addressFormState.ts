/** 주문·결제 흐름에서 새 배송지를 입력받는 폼 상태 */
export type NewAddrState = {
  receiverName: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  memo: string;
};

export const EMPTY_ADDR_STATE: NewAddrState = {
  receiverName: "",
  phoneNumber: "",
  zipCode: "",
  address: "",
  addressDetail: "",
  memo: "",
};
