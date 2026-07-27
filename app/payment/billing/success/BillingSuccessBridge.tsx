"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { BillingInfo } from "@/features/billing/api/types";

// 팝업(/payment)에서 진입한 경우 opener(주문/마이페이지)로 결과를 전달하고 창을 닫는다.
// opener가 없는 경우(직접 진입 등)에는 이 화면이 그대로 완료 안내로 남는다.
export default function BillingSuccessBridge({ billing }: { billing: BillingInfo }) {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(
        { type: "PAYMENT_SELECTED", method: "신용카드", billing },
        window.location.origin,
      );
      window.close();
    }
  }, [billing]);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <h1 className="text-2xl font-bold">카드 등록이 완료되었습니다</h1>
        <p className="text-zinc-600">
          {billing.cardCompany} **** {billing.lastFourDigits}
        </p>
        <Link
          href="/subscribe"
          className="text-sm font-medium text-zinc-500 hover:underline"
        >
          ← 구독으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
