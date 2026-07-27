"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { BillingInfo } from "@/features/billing/api/types";
import { notifyBillingUpdated } from "@/features/billing/lib/billingSync";
import { getCardCompany, getLastFourDigits } from "@/features/billing/lib/formatBillingLabel";

// 카드 등록/변경 완료 후처리.
// 1) 같은 오리진의 모든 창에 브로드캐스트 — 카드사 인증 과정에서 opener가 끊겨도 마이페이지가 갱신된다.
// 2) opener가 살아 있으면 기존대로 결과를 전달하고 창을 닫는다.
// 둘 다 실패해도 이 화면이 완료 안내로 남는다.
export default function BillingSuccessBridge({ billing }: { billing: BillingInfo }) {
  useEffect(() => {
    notifyBillingUpdated();

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
          {getCardCompany(billing)} **** {getLastFourDigits(billing)}
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
