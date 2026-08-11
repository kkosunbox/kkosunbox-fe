import { getMessageByCode } from "@/shared/lib/api";
import BillingFailActions from "./BillingFailActions";

// Toss 자동결제(빌링) 카드 등록 실패/취소 리다이렉트.
// Toss가 내려주는 message는 백엔드 에러와 동일하게 사용자에게 직접 노출하지 않고,
// code를 중앙 에러 맵(shared/lib/api/errorMessages.ts)으로 변환해 보여준다.

type SearchParams = {
  code?: string;
  /**
   * Toss가 함께 내려주는 원문 메시지. 백엔드/외부 에러 메시지를 그대로 노출하지 않는
   * 프로젝트 규칙에 따라 화면에도, 로그에도 쓰지 않는다(존재만 문서화).
   */
  message?: string;
};

export default async function BillingFailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { code } = await searchParams;

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
