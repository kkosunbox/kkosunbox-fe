import { getMessageByCode } from "@/shared/lib/api";
import BillingFailActions from "./BillingFailActions";
// TODO(billing-debug): dev 실연동 검증용 임시 로그 — 검증 끝나면 import·호출부 제거
import { logBillingNote } from "@/features/billing/lib/billingDebugLog";

// Toss 자동결제(빌링) 카드 등록 실패/취소 리다이렉트.
// Toss가 내려주는 message는 백엔드 에러와 동일하게 사용자에게 직접 노출하지 않고,
// code를 중앙 에러 맵(shared/lib/api/errorMessages.ts)으로 변환해 보여준다.

type SearchParams = {
  code?: string;
  /** 화면에는 쓰지 않는다. dev 디버그 로그로만 남기는 Toss 원문 메시지. */
  message?: string;
};

export default async function BillingFailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { code, message } = await searchParams;

  // TODO(billing-debug): dev 실연동 검증용 임시 로그 — 검증 끝나면 제거
  // 사용자에게는 매핑된 한국어만 보여주므로, 원인 파악용 원문은 서버 로그에만 남긴다.
  logBillingNote("failUrl 진입", { code: code ?? null, tossMessage: message ?? null });

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <h1 className="text-2xl font-bold">카드 등록에 실패했습니다</h1>
        <p className="text-zinc-600">
          {getMessageByCode(code, "카드 등록 처리 중 오류가 발생했습니다.")}
        </p>

        <BillingFailActions />
      </div>
    </main>
  );
}
