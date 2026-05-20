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

export function ProfileSectionSkeleton() {
  return (
    <section className="pt-6 lg:pt-7">
      <div className="mx-auto w-full max-w-content max-lg:px-6 lg:px-0">
        <div className="rounded-[20px] bg-white shadow-[0_8px_30px_rgba(185,148,116,0.06)] max-lg:px-7 max-lg:py-7 lg:px-7 lg:py-[26px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0">
            {/* 아바타 + 프로필 정보 */}
            <div className="flex min-w-0 flex-1 items-center gap-5 lg:gap-8">
              <Bone className="h-[80px] w-[80px] shrink-0 rounded-full lg:h-[124px] lg:w-[124px]" />
              <div className="flex-1 space-y-3">
                <Bone className="h-6 w-32" />
                <Bone className="h-4 w-48" />
                <Bone className="h-4 w-40" />
              </div>
            </div>
            {/* 체크리스트 (데스크톱) */}
            <div className="max-lg:hidden lg:w-[318px] lg:flex-none lg:self-center">
              <Bone className="h-[120px] rounded-[12px]" />
            </div>
          </div>
          {/* 체크리스트 (모바일) */}
          <div className="mt-4 lg:hidden">
            <Bone className="h-[120px] rounded-[12px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CardSkeleton() {
  return (
    <div className={`${DASHBOARD_CARD_SURFACE_CLASS} gap-4 max-lg:min-h-0 max-lg:h-auto`}>
      <Bone className="h-5 w-24" />
      <div className="flex flex-1 flex-col gap-3">
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-3/4" />
        <Bone className="h-4 w-1/2" />
      </div>
    </div>
  );
}
