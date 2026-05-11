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
    <section className="pt-6 md:pt-7">
      <div className="mx-auto w-full max-w-content max-md:px-6 md:px-0">
        <div className="rounded-[20px] bg-white shadow-[0_8px_30px_rgba(185,148,116,0.06)] max-md:px-7 max-md:py-7 md:px-7 md:py-[26px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0">
            {/* 아바타 + 프로필 정보 */}
            <div className="flex min-w-0 flex-1 items-center gap-5 md:gap-8">
              <Bone className="h-[80px] w-[80px] shrink-0 rounded-full md:h-[124px] md:w-[124px]" />
              <div className="flex-1 space-y-3">
                <Bone className="h-6 w-32" />
                <Bone className="h-4 w-48" />
                <Bone className="h-4 w-40" />
              </div>
            </div>
            {/* 체크리스트 (데스크톱) */}
            <div className="max-md:hidden md:w-[318px] md:flex-none md:self-center">
              <Bone className="h-[120px] rounded-[12px]" />
            </div>
          </div>
          {/* 체크리스트 (모바일) */}
          <div className="mt-4 md:hidden">
            <Bone className="h-[120px] rounded-[12px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] max-md:bg-white max-md:px-7 max-md:py-6 md:min-h-[173px] md:bg-[var(--color-surface-light)] md:px-8 md:py-6">
      <Bone className="h-5 w-24" />
      <div className="flex flex-1 flex-col gap-3">
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-3/4" />
        <Bone className="h-4 w-1/2" />
      </div>
    </div>
  );
}
