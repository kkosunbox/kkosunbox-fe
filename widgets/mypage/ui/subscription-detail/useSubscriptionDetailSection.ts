"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { trackSubscriptionCancelAttempt } from "@/shared/lib/analytics";
import {
  cancelPayment,
  cancelSubscription,
  deleteSubscriptionRecord,
  getPaymentReceipt,
  pauseSubscription,
  reactivateSubscription,
  resumeSubscription,
} from "@/features/subscription/api/subscriptionApi";
import { packageThemeForPlan } from "@/entities/package";
import type { UserSubscriptionDto, SubscriptionPaymentDto } from "@/features/subscription/api/types";
import { ITEMS_PER_PAGE, billingDayLabel, deriveStartDate, formatDate } from "./helpers";

/**
 * 구독 상세 Section의 조정자(Coordinator).
 * 구독·결제 액션 오케스트레이션과 결제내역 페이지네이션 상태만 담당한다.
 */
export function useSubscriptionDetailSection({
  subscription,
  payments,
}: {
  subscription: UserSubscriptionDto;
  payments: SubscriptionPaymentDto[];
}) {
  const router = useRouter();
  const { openModal, openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [, startTransition] = useTransition();
  const [page, setPage] = useState(1);

  const isActive = subscription.isActive;
  const theme = packageThemeForPlan(subscription.plan);
  const startDate = deriveStartDate(payments, subscription.nextBillingDate);
  const endDate = subscription.cancelledAt
    ? subscription.cancelledAt.slice(0, 10)
    : subscription.terminatedAt
      ? subscription.terminatedAt.slice(0, 10)
      : null;

  const totalPages = Math.max(1, Math.ceil(payments.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const records = payments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  function handleDeleteRecord() {
    openAlert({
      type: "info",
      title: "구독 이력을 삭제할까요?",
      description: "삭제하면 해당 구독 정보가 목록에서 제거됩니다.",
      primaryLabel: "삭제",
      secondaryLabel: "취소",
      onPrimary: () => {
        showLoading("구독 이력을 삭제하고 있습니다...");
        startTransition(async () => {
          try {
            await deleteSubscriptionRecord(subscription.id);
            router.push("/mypage/subscription");
            router.refresh();
          } catch (err) {
            openAlert({ title: getErrorMessage(err, "구독 이력 삭제 중 오류가 발생했습니다.") });
          } finally {
            hideLoading();
          }
        });
      },
    });
  }

  function handleResubscribe() {
    openModal("subscription-restart", () => {
      showLoading("구독을 재시작하고 있습니다...");
      startTransition(async () => {
        try {
          await reactivateSubscription(subscription.id);
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

  function handleCancel() {
    trackSubscriptionCancelAttempt();
    const hasCancellablePayment = payments.some(
      (p) => p.status === "completed" && p.deliveryStatus !== "DeliveryCompleted",
    );

    const doCancel = (cancelEligiblePayments: boolean) => {
      showLoading("구독 해지를 처리하고 있습니다...");
      startTransition(async () => {
        try {
          await cancelSubscription(subscription.id, cancelEligiblePayments || undefined);
          router.push("/mypage/subscription");
          router.refresh();
        } catch (err) {
          openAlert({ title: getErrorMessage(err, "구독 해지 처리 중 오류가 발생했습니다.") });
        } finally {
          hideLoading();
        }
      });
    };

    if (hasCancellablePayment) {
      openModal(
        "subscription-cancel-with-delivery",
        () => doCancel(false),
        () => doCancel(true),
      );
    } else {
      openModal("subscription-cancel", () => doCancel(false));
    }
  }

  function handleTogglePause() {
    const isPaused = subscription.isPaused;
    if (isPaused) {
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
              await resumeSubscription(subscription.id);
              router.refresh();
            } catch (err) {
              openAlert({ title: getErrorMessage(err, "쉬어가기 해제 처리 중 오류가 발생했습니다.") });
            } finally {
              hideLoading();
            }
          });
        },
      });
    } else {
      openModal("subscription-pause", () => {
        showLoading("쉬어가기를 적용하고 있습니다...");
        startTransition(async () => {
          try {
            await pauseSubscription(subscription.id);
            router.refresh();
          } catch (err) {
            openAlert({ title: getErrorMessage(err, "쉬어가기 처리 중 오류가 발생했습니다.") });
          } finally {
            hideLoading();
          }
        });
      });
    }
  }

  function handleCancelPayment(paymentId: number) {
    openModal(
      "payment-cancel",
      () => {
        showLoading("결제를 취소하고 있습니다...");
        startTransition(async () => {
          try {
            await cancelPayment(paymentId);
            router.refresh();
          } catch (err) {
            openAlert({ title: getErrorMessage(err, "결제 취소 처리 중 오류가 발생했습니다.") });
          } finally {
            hideLoading();
          }
        });
      },
      () => {
        showLoading("결제 취소 및 구독 해지를 처리하고 있습니다...");
        startTransition(async () => {
          try {
            await cancelPayment(paymentId, { cancelSubscription: true });
            router.push("/mypage/subscription");
            router.refresh();
          } catch (err) {
            openAlert({ title: getErrorMessage(err, "처리 중 오류가 발생했습니다.") });
          } finally {
            hideLoading();
          }
        });
      },
    );
  }

  function handleChangeSubscription() {
    openModal("subscription-change-confirm", () => {
      router.push(`/mypage/subscription/change?subscriptionId=${subscription.id}`);
    });
  }

  function handleReceiptDownload(paymentId: number) {
    startTransition(async () => {
      try {
        const data = await getPaymentReceipt(String(paymentId));
        window.open(data.receiptUrl, "_blank", "noopener,noreferrer");
      } catch (err) {
        openAlert({ title: getErrorMessage(err, "영수증을 불러올 수 없습니다.") });
      }
    });
  }

  function goBack() {
    router.back();
  }

  function goToPrevPage() {
    setPage((p) => Math.max(1, p - 1));
  }

  function goToNextPage() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  return {
    subscription,
    payments,
    theme,
    isActive,
    startDate,
    endDate,
    records,
    currentPage,
    totalPages,
    formatDate,
    billingDayLabel,
    handleDeleteRecord,
    handleResubscribe,
    handleCancel,
    handleTogglePause,
    handleCancelPayment,
    handleChangeSubscription,
    handleReceiptDownload,
    goBack,
    goToPrevPage,
    goToNextPage,
    setPage,
  };
}

export type SubscriptionDetailViewModel = ReturnType<typeof useSubscriptionDetailSection>;
