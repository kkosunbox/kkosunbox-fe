import type { Dispatch, SetStateAction } from "react";
import { getCenteredPopupPosition } from "@/shared/lib/popup";
import type { NewAddrState } from "./addressFormState";

/**
 * Daum 우편번호 팝업 크기.
 *
 * 팝업 모드에서는 **px 숫자만 유효**하다 — `"100%"` 같은 퍼센트는 레이어(embed) 모드 전용이라
 * 팝업에서는 조용히 기본값(500×500)으로 떨어진다. 그러면 실제 창 크기가 우리가 중앙 계산에
 * 쓴 값과 어긋나 팝업이 중앙에서 밀린다. 그래서 여기서 크기를 명시하고 같은 값으로 좌표를 낸다.
 */
const DAUM_POSTCODE_POPUP_SIZE = { width: 500, height: 600 };

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
    width: DAUM_POSTCODE_POPUP_SIZE.width,
    height: DAUM_POSTCODE_POPUP_SIZE.height,
  });
  // open()에 좌표를 안 넘기면 Daum 팝업도 브라우저 기본 위치(직전 팝업 자리)에 뜬다.
  postcode.open(getCenteredPopupPosition(DAUM_POSTCODE_POPUP_SIZE));
}
