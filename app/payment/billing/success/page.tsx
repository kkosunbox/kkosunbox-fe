import Link from "next/link";
import { getServerToken } from "@/features/auth/lib/session";
import { registerBillingKey, updateBillingKey } from "@/features/billing/api/queries";
// TODO(billing-debug): dev 실연동 검증용 임시 로그 — 검증 끝나면 import·호출부 제거
import { logBillingNote } from "@/features/billing/lib/billingDebugLog";
import { getErrorMessage } from "@/shared/lib/api";
import BillingSuccessBridge from "./BillingSuccessBridge";

// Toss 자동결제(빌링) 카드 등록 인증 완료 리다이렉트.
// authKey·customerKey는 여기(서버)에서만 소비해 백엔드 발급을 완료하며,
// 클라이언트로 내려보내거나 화면에 렌더링하지 않는다.

type SearchParams = {
  authKey?: string;
  customerKey?: string;
  billingInfoId?: string;
};

function StatusPage({ title, message }: { title: string; message: string }) {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-zinc-600">{message}</p>
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

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { authKey, customerKey, billingInfoId } = await searchParams;

  // TODO(billing-debug): dev 실연동 검증용 임시 로그 — 검증 끝나면 제거
  logBillingNote("successUrl 진입", {
    hasAuthKey: Boolean(authKey),
    hasCustomerKey: Boolean(customerKey),
    billingInfoId: billingInfoId ?? null,
  });

  const token = await getServerToken();
  if (!token) {
    logBillingNote("중단: 서버 토큰 없음(비로그인/쿠키 미전달)");
    return (
      <StatusPage
        title="로그인이 필요합니다"
        message="다시 로그인한 뒤 카드를 등록해 주세요."
      />
    );
  }

  if (!authKey || !customerKey) {
    logBillingNote("중단: authKey 또는 customerKey 누락");
    return (
      <StatusPage
        title="카드 등록에 실패했습니다"
        message="인증 정보를 확인할 수 없습니다. 다시 시도해 주세요."
      />
    );
  }

  const parsedBillingInfoId = billingInfoId ? Number(billingInfoId) : undefined;
  const isUpdate = parsedBillingInfoId !== undefined && Number.isFinite(parsedBillingInfoId);

  let billing;
  try {
    billing = isUpdate
      ? await updateBillingKey(
          { billingInfoId: parsedBillingInfoId, authKey, customerKey },
          token,
        )
      : await registerBillingKey({ authKey, customerKey }, token);
  } catch (err) {
    return (
      <StatusPage
        title="카드 등록에 실패했습니다"
        message={getErrorMessage(err, "카드 등록 처리 중 오류가 발생했습니다.")}
      />
    );
  }

  return <BillingSuccessBridge billing={billing} />;
}
