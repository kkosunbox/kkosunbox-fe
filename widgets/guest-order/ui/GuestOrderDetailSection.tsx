"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  clearGuestOrderAccess,
  getGuestOrderAccessErrorMessage,
  readGuestOrderAccess,
  type GuestOrderAccess,
} from "@/features/guest-order";
import {
  cancelGuestOrder,
  getGuestOrderReceipt,
  lookupGuestOrder,
  type CancelProductOrderItemRequest,
  type GuestProductOrderDetail,
} from "@/features/product/api";
import { isErrorCode } from "@/shared/lib/api";
import { formatPhoneNumber } from "@/shared/lib/format";
import { LoadingOverlay, PageHeaderBand, useLoadingOverlay, useModal } from "@/shared/ui";
import { GuestOrderCancelModal } from "./GuestOrderCancelModal";
import {
  GUEST_ORDER_CARD,
  GUEST_ORDER_CARD_RIGHT,
  GUEST_ORDER_HEADING,
  GuestDeliveryProgress,
  GuestOrderInfoCard,
  GuestOrderNumberBar,
} from "./GuestOrderParts";

const LOOKUP_PATH = "/login/guest";

function ReceiptIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3M12 3v11m-4-4 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 비회원 주문 상세 — 같은 탭 세션에 저장된 조회 키(주문번호 + 주문자 연락처)로 조회한다.
 * 키가 없으면(새 탭·링크 공유) 비회원 주문조회 폼으로 보낸다.
 */
export default function GuestOrderDetailSection({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [access, setAccess] = useState<GuestOrderAccess | null>(null);
  const [detail, setDetail] = useState<GuestProductOrderDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (key: GuestOrderAccess) => {
    try {
      setDetail(await lookupGuestOrder(key));
      setLoadError(null);
    } catch (err) {
      if (isErrorCode(err, "PAYMENT_NOT_FOUND")) clearGuestOrderAccess();
      setLoadError(getGuestOrderAccessErrorMessage(err, "주문을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."));
    }
  }, []);

  useEffect(() => {
    const key = readGuestOrderAccess(orderId);
    if (!key) {
      router.replace(LOOKUP_PATH);
      return;
    }
    setAccess(key);
    void load(key);
  }, [orderId, router, load]);

  if (loadError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-white px-6 pb-20 pt-[calc(var(--header-offset)+80px)] text-center">
        <p className="text-body-16-m text-[var(--color-text)]">{loadError}</p>
        <Link href={LOOKUP_PATH} className="inline-flex h-10 items-center rounded-[8px] bg-[var(--color-cta-button)] px-6 text-body-14-sb text-white">
          비회원 주문조회
        </Link>
      </div>
    );
  }
  if (!access || !detail) return <LoadingOverlay visible />;

  const { order } = detail;
  const canCancel = order.deliveryStatus === "PendingDelivery"
    && (order.status === "completed" || order.status === "partially_refunded")
    && order.items.some((item) => item.remainingQuantity > 0);
  const canReceipt = order.status === "completed" || order.status === "partially_refunded";

  async function openReceipt() {
    if (!access) return;
    setBusy(true);
    // 클릭 이벤트 안에서 창을 열어 비동기 응답 이후 팝업 차단을 피한다.
    const popup = window.open("about:blank", "_blank");
    if (popup) popup.opener = null;
    try {
      const data = await getGuestOrderReceipt(access);
      if (popup) popup.location.replace(data.receiptUrl);
      else openAlert({ title: "팝업이 차단되었습니다.", description: "브라우저에서 팝업을 허용한 후 다시 시도해 주세요." });
    } catch (err) {
      popup?.close();
      openAlert({ title: getGuestOrderAccessErrorMessage(err, "영수증을 불러올 수 없습니다.") });
    } finally {
      setBusy(false);
    }
  }

  async function cancel(items?: CancelProductOrderItemRequest[]) {
    if (!access || busy) return;
    setBusy(true);
    showLoading("주문을 취소하고 있습니다...");
    try {
      await cancelGuestOrder({ ...access, items });
      setCancelOpen(false);
      await load(access);
      openAlert({ title: "주문이 취소되었습니다." });
    } catch (err) {
      if (items && isErrorCode(err, "PAYMENT_CANCELLATION_NOT_ALLOWED")) {
        openAlert({
          title: "부분 취소가 불가능합니다.",
          description: "부분 취소 후 배송비가 취소 금액보다 크거나 같습니다. 전액 취소를 이용해주세요.",
          primaryLabel: "전액 취소",
          secondaryLabel: "닫기",
          onPrimary: () => void cancel(),
        });
      } else {
        openAlert({ title: getGuestOrderAccessErrorMessage(err, "주문 취소 중 오류가 발생했습니다.") });
      }
    } finally {
      setBusy(false);
      hideLoading();
    }
  }

  return (
    <div className="bg-white pt-[var(--header-offset)]">
      {cancelOpen && (
        <GuestOrderCancelModal items={order.items} busy={busy} onClose={() => setCancelOpen(false)} onConfirm={(items) => void cancel(items)} />
      )}
      <PageHeaderBand
        title="비회원 주문 상세정보"
        description="주문하신 상품의 상세정보입니다."
        backControl={
          <Link href={LOOKUP_PATH} aria-label="비회원 주문조회로 돌아가기" className="text-[var(--color-text-secondary)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        }
      />
      <div className="mx-auto w-full max-w-[1240px] pb-[74px] pt-9 max-xl:px-6 xl:px-0">
        <div className="mb-6">
          <GuestOrderNumberBar
            orderId={order.orderId}
            createdAt={order.createdAt}
            actions={
              <button type="button" disabled={!canReceipt || busy} onClick={() => void openReceipt()} className="inline-flex items-center gap-1 text-body-13-m text-[var(--color-text-secondary)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50">
                <ReceiptIcon />구매 영수증
              </button>
            }
          />
        </div>

        <div className={GUEST_ORDER_CARD}>
          <section className="min-w-0 md:pr-10">
            <h2 className={GUEST_ORDER_HEADING}>배송지</h2>
            <div className="space-y-1 text-body-14-m text-[var(--color-text)]">
              <p className="text-subtitle-16-b">{detail.receiverName}</p>
              <p>{formatPhoneNumber(detail.receiverPhone)}</p>
              <p className="break-words">{detail.address}{detail.addressDetail ? ` ${detail.addressDetail}` : ""} ({detail.zipCode})</p>
              {detail.memo && <p className="text-[var(--color-text-secondary)]">배송 메모: {detail.memo}</p>}
            </div>
          </section>
          <section className={GUEST_ORDER_CARD_RIGHT}>
            <h2 className={GUEST_ORDER_HEADING}>배송조회</h2>
            <GuestDeliveryProgress order={order} />
          </section>
        </div>

        <div className="mt-6">
          <GuestOrderInfoCard order={order} />
        </div>

        <button
          type="button"
          disabled={!canCancel || busy}
          onClick={() => setCancelOpen(true)}
          className="mt-6 rounded-[6px] border border-[var(--color-text-muted)] px-5 py-2 text-body-14-m text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "처리 중..." : "주문취소"}
        </button>
      </div>
    </div>
  );
}
