"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { consumeReviewPrompt } from "@/features/review/api";
import { buildReviewWriteHref } from "@/features/review/lib/reviewWriteHref";
import { useModal } from "@/shared/ui/modal/ModalProvider";

/**
 * 메인 첫 진입 시 배송완료 리뷰 유도 팝업
 * 서버가 마지막 확인 이후 배송완료·미작성 건 중 가장 최근 1건을 내려주고 즉시 확인 처리하므로
 * 여러 건이 쌓여도 한 번만 뜬다. "리뷰쓰기"는 해당 상품의 작성 화면으로 이동한다.
 */
export default function DeliveryReviewPrompt() {
  const router = useRouter();
  const { isLoggedIn, isAuthLoading } = useAuth();
  const { openModal } = useModal();
  const requestedRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 요청은 한 번만 보내고(서버가 호출 즉시 확인 처리), 응답 시점에 메인을 벗어났으면 띄우지 않는다.
  useEffect(() => {
    if (isAuthLoading || !isLoggedIn || requestedRef.current) return;
    requestedRef.current = true;

    consumeReviewPrompt()
      .then(({ target }) => {
        const href = target ? buildReviewWriteHref(target) : null;
        if (!mountedRef.current || !href) return;
        openModal("delivery-review", () => router.push(href));
      })
      .catch(() => {
        // 팝업은 부가 기능이므로 실패해도 메인 화면 이용에 영향을 주지 않는다.
      });
  }, [isAuthLoading, isLoggedIn, openModal, router]);

  return null;
}
