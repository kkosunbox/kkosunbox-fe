import { DASHBOARD_CARD_SURFACE_CLASS } from "../lib/dashboard-shared";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={[
        "animate-pulse rounded-md bg-[var(--color-border)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function SectionHeaderSkeleton({ tight = false }: { tight?: boolean }) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-3",
        tight ? "mb-4 lg:mb-3" : "max-lg:mb-6 lg:mb-4",
      ].join(" ")}
    >
      <Bone className="h-5 w-20" />
      <Bone className="h-4 w-14" />
    </div>
  );
}

/** ProfileSection 레이아웃과 동일한 구조 (모바일: 크림 배경 / 데스크탑: 좌측 흰 패널) */
export function ProfileSectionSkeleton() {
  return (
    <section className="max-lg:pt-1 max-lg:pb-6 lg:h-full">
      <div className="mx-auto w-full max-lg:max-w-content max-lg:px-6 lg:h-full">
        <div className="relative px-7 py-7 lg:hidden">
          <Bone className="absolute top-4 right-7 h-4 w-14" />
          <div className="flex w-full flex-col gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-5">
              <Bone className="h-[80px] w-[80px] shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-[12px]">
                  <Bone className="h-5 w-32" />
                  <Bone className="h-4 w-24" />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Bone className="h-4 w-16" />
                  <Bone className="h-4 w-10" />
                  <Bone className="h-4 w-14" />
                </div>
                <Bone className="mt-1 h-4 w-full max-w-[280px]" />
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-[var(--color-divider-neutral)] pt-4">
            <Bone className="mb-2.5 h-4 w-16" />
            <Bone className="h-[120px] w-full rounded-[12px]" />
          </div>
        </div>

        <div className="flex h-full flex-col items-center rounded-[12px] bg-white px-5 pt-12 pb-6 max-lg:hidden">
          <Bone className="h-[80px] w-[80px] shrink-0 rounded-full" />
          <Bone className="mt-[30px] h-8 w-28" />
          <Bone className="mt-[11px] h-5 w-20" />
          <Bone className="mt-3 h-5 w-40" />
          <Bone className="mt-3 h-5 w-44" />
          <Bone className="mt-7 min-h-[183px] w-full flex-1 rounded-[12px]" />
        </div>
      </div>
    </section>
  );
}

/** GreetingBanner — 데스크탑 인사 배너 */
export function GreetingBannerSkeleton() {
  return (
    <div className="flex h-[149px] flex-col justify-center gap-3 rounded-[12px] bg-[var(--color-mypage-greeting-surface)] pl-[38px]">
      <Bone className="h-4 w-44" />
      <Bone className="h-7 w-[420px] max-w-[80%]" />
    </div>
  );
}

/** SubscriptionCard — 오렌지 카드 / lg 186px / 모바일 하단 여백 */
export function SubscriptionCardSkeleton() {
  return (
    <div className="relative max-lg:h-[144px] lg:h-[186px]">
      <Bone className="h-full w-full rounded-[16px] lg:rounded-[20px]" />
    </div>
  );
}

/** PaymentCard — 주문 유형별 건수 카드 2열 */
export function PaymentCardSkeleton() {
  return (
    <div className={`${DASHBOARD_CARD_SURFACE_CLASS} gap-0 lg:h-[186px]`}>
      <SectionHeaderSkeleton />
      <div className="grid grid-cols-2 max-md:gap-3 md:gap-5">
        {[0, 1].map((i) => (
          <Bone key={i} className="h-[85px] rounded-[12px]" />
        ))}
      </div>
    </div>
  );
}

/** DeliveryCard — 3열 아이콘 + 라벨 + 숫자 */
export function DeliveryCardSkeleton() {
  return (
    <div className={`${DASHBOARD_CARD_SURFACE_CLASS} lg:h-[208px]`}>
      <SectionHeaderSkeleton tight />
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-4 pt-1 max-lg:-mx-3 max-lg:px-[24px] lg:px-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <Bone className="mb-4 h-10 w-10 rounded-full max-lg:mb-4 lg:mb-2" />
            <Bone className="mb-3 h-4 w-14 max-lg:mb-3 lg:mb-1.5" />
            <Bone className="h-6 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** InquiryCard — 헤더 + 목록 3줄 + 페이지네이션 */
export function InquiryCardSkeleton() {
  return (
    <div className={`${DASHBOARD_CARD_SURFACE_CLASS} lg:h-[208px]`}>
      <SectionHeaderSkeleton tight />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-0">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={[
                "flex items-center gap-x-3 max-lg:py-1.5 lg:py-1",
                i < 2 ? "border-b border-[var(--color-divider-warm)]" : "",
              ].join(" ")}
            >
              <Bone className="h-4 flex-1" />
              <Bone className="h-5 w-12 shrink-0 rounded-[4px]" />
            </div>
          ))}
        </div>
        <div className="mt-auto flex shrink-0 items-center justify-center max-lg:gap-2 max-lg:pt-4 lg:gap-1 lg:pt-2">
          <Bone className="h-5 w-5 rounded-full" />
          <Bone className="h-4 w-4" />
          <Bone className="h-4 w-4" />
          <Bone className="h-5 w-5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** @deprecated 카드별 스켈레톤 사용 권장 */
export function CardSkeleton() {
  return <PaymentCardSkeleton />;
}
