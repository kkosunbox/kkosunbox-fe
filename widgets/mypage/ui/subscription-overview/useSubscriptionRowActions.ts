"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import {
  reactivateSubscription,
  resumeSubscription,
} from "@/features/subscription/api/subscriptionApi";

/**
 * 구독 목록 카드의 버튼 액션 (구독 재개 · 구독 변경 · 구독 재시작).
 * 확인 모달·문구는 구독 상세(useSubscriptionDetailSection)와 동일하게 맞춘다.
 */
export function useSubscriptionRowActions() {
  const router = useRouter();
  const { openModal, openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [, startTransition] = useTransition();

  function handleResume(subscriptionId: number) {
    openAlert({
      type: "info",
      title: "구독 쉬어가기를 해제할까요?",
      description: "다음 결제일에 정상적으로 결제됩니다.",
      primaryLabel: "쉬어가기 해제",
      secondaryLabel: "다음에 할게요",
      onPrimary: () => {
        showLoading("쉬어가기를 해제하고 있습니다...");
        startTransition(async () => {
          try {
            await resumeSubscription(subscriptionId);
            router.refresh();
          } catch (err) {
            openAlert({ title: getErrorMessage(err, "쉬어가기 해제 처리 중 오류가 발생했습니다.") });
          } finally {
            hideLoading();
          }
        });
      },
    });
  }

  function handleChange(subscriptionId: number) {
    openModal("subscription-change-confirm", () => {
      router.push(`/mypage/subscription/change?subscriptionId=${subscriptionId}`);
    });
  }

  function handleRestart(subscriptionId: number) {
    openModal("subscription-restart", () => {
      showLoading("구독을 재시작하고 있습니다...");
      startTransition(async () => {
        try {
          await reactivateSubscription(subscriptionId);
          openAlert({ type: "success", title: "구독이 재시작되었습니다." });
          router.refresh();
        } catch (err) {
          openAlert({ title: getErrorMessage(err, "구독 재시작 처리 중 오류가 발생했습니다.") });
        } finally {
          hideLoading();
        }
      });
    });
  }

  return { handleResume, handleChange, handleRestart };
}
