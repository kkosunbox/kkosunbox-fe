"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useModal } from "@/shared/ui";
import { getMessageByCode } from "@/shared/lib/api";

/** /purchase/order/{success,fail}에서 리다이렉트된 결제 실패를 모달로 안내한다 */
export default function PurchasePaymentErrorNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openAlert } = useModal();

  useEffect(() => {
    const code = searchParams.get("confirmError");
    if (!code) return;
    openAlert({
      title: "결제에 실패했습니다",
      description: getMessageByCode(code, "결제 처리 중 오류가 발생했습니다. 다시 시도해주세요."),
    });
    router.replace("/purchase");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 최초 마운트 시 쿼리 1회만 확인
  }, []);

  return null;
}
