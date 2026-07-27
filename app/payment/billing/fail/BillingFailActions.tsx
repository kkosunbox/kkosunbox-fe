"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

// opener 유무는 한 번 정해지면 바뀌지 않으므로 구독은 no-op.
// 서버 스냅샷을 false로 두어 SSR 결과(일반 탭 기준)와 첫 클라이언트 렌더를 일치시킨다.
const noopSubscribe = () => () => {};
const isPopupSnapshot = () => Boolean(window.opener);
const isPopupServerSnapshot = () => false;

// 등록 실패/취소 후 다음 행동.
// `windowTarget: "self"` 로 Toss 페이지가 창을 통째로 이동시키기 때문에, 취소해도
// 원래 화면(카드 등록)으로 저절로 돌아오지 않는다. 그래서 복귀 수단을 직접 제공한다.
//   - 결제 팝업 안(opener 있음): 카드 등록 화면으로 다시 시도 / 창 닫기
//   - 일반 탭(주문 페이지 인라인 흐름 등): 구독으로 돌아가기
export default function BillingFailActions() {
  const isPopup = useSyncExternalStore(
    noopSubscribe,
    isPopupSnapshot,
    isPopupServerSnapshot,
  );

  if (!isPopup) {
    return (
      <Link href="/subscribe" className="text-sm font-medium text-zinc-500 hover:underline">
        ← 구독으로 돌아가기
      </Link>
    );
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/payment?method=${encodeURIComponent("신용카드")}`}
        className="flex h-11 flex-1 items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white hover:opacity-90"
      >
        다시 시도
      </Link>
      <button
        type="button"
        onClick={() => window.close()}
        className="flex h-11 flex-1 items-center justify-center rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
      >
        닫기
      </button>
    </div>
  );
}
