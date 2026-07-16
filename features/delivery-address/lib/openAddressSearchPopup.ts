import type { Dispatch, SetStateAction } from "react";
import type { NewAddrState } from "./addressFormState";

/** Daum 우편번호 검색 팝업을 열고, 완료 시 우편번호·주소를 newAddr 상태에 반영한다 */
export function openAddressSearchPopup(setNewAddr: Dispatch<SetStateAction<NewAddrState>>): void {
  if (typeof window === "undefined" || !window.daum) return;

  const postcode = new window.daum.Postcode({
    oncomplete(data: {
      zonecode: string;
      roadAddress: string;
      jibunAddress: string;
      addressType: string;
    }) {
      const addr = data.addressType === "R" ? data.roadAddress : data.jibunAddress;
      setNewAddr((s) => ({ ...s, zipCode: data.zonecode, address: addr }));
    },
    width: "100%",
    height: "100%",
  });
  postcode.open();
}
