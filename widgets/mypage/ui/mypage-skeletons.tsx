import { DASHBOARD_CARD_SURFACE_CLASS } from "./dashboard-shared";

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

/** ProfileSection 레이아웃과 동일한 구조 (크림 배경, 흰 카드 없음) */
export function ProfileSectionSkeleton() {
  return (
    <section className="pt-6 pb-6 lg:pt-3 lg:pb-3">
      <div className="mx-auto w-full max-w-content max-lg:px-6 lg:px-0">
        <div className="relative max-lg:px-7 max-lg:py-7 lg:px-7 lg:py-[26px]">
          <Bone className="lg:hidden absolute top-4 right-7 h-4 w-14" />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0">
            <div className="relative flex min-w-0 flex-1 items-start gap-5 lg:min-h-0 lg:items-center lg:gap-8 lg:self-stretch">
              <Bone className="max-lg:hidden absolute top-0 right-2 h-4 w-14" />
              <Bone className="h-[80px] w-[80px] shrink-0 rounded-full lg:h-[124px] lg:w-[124px]" />
              <div className="min-w-0 flex-1 lg:pr-[84px]">
                <div className="flex flex-col gap-[12px]">
                  <Bone className="h-7 w-32 max-lg:h-5" />
                  <Bone className="h-5 w-24 max-lg:h-4" />
                </div>
                <div className="mt-3 flex items-center gap-3 lg:mt-[10px]">
                  <Bone className="h-5 w-16 max-lg:h-4" />
                  <Bone className="h-5 w-10 max-lg:h-4" />
                  <Bone className="h-5 w-14 max-lg:h-4" />
                </div>
                <Bone className="mt-1 h-5 w-full max-w-[280px] max-lg:h-4" />
              </div>
            </div>

            <div
              className="max-lg:hidden mx-[20px] w-px self-stretch bg-[var(--color-text-muted)]"
              aria-hidden
            />

            <div className="max-lg:hidden lg:w-[358px] lg:flex-none lg:self-center">
              <Bone className="mb-2.5 h-4 w-16" />
              <Bone className="h-[120px] w-full rounded-[12px]" />
            </div>
          </div>

          <div className="mt-4 border-t border-[var(--color-divider-neutral)] pt-4 lg:hidden">
            <Bone className="mb-2.5 h-4 w-16" />
            <Bone className="h-[120px] w-full rounded-[12px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** SubscriptionCard — 오렌지 카드 / lg 186px / 모바일 하단 여백 */
export function SubscriptionCardSkeleton() {
  return (
    <div className="relative max-lg:mb-5 lg:h-[186px]">
      <Bone className="h-full min-h-[140px] w-full rounded-[20px] max-lg:min-h-[140px] lg:h-[186px]" />
    </div>
  );
}

/** PaymentCard — DashboardCard + 3행 */
export function PaymentCardSkeleton() {
  return (
    <div className={`${DASHBOARD_CARD_SURFACE_CLASS} gap-0 lg:h-[186px]`}>
      <SectionHeaderSkeleton />
      <div className="flex min-h-0 flex-1 flex-col max-lg:gap-4 lg:gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Bone className="h-4 w-16 shrink-0 lg:w-[88px]" />
            <Bone className="h-4 flex-1 max-w-[200px]" />
          </div>
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
    <div className={`${DASHBOARD_CARD_SURFACE_CLASS} max-lg:min-h-0 max-lg:h-auto lg:h-[208px]`}>
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
        <div className="mt-auto flex shrink-0 items-center justify-center gap-1 max-lg:pt-4 lg:pt-2">
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
